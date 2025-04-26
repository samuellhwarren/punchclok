const clockButton = document.getElementById("clockButton");
const startTimeEl = document.getElementById("startTime");
const endTimeEl = document.getElementById("endTime");
const totalTimeEl = document.getElementById("totalTime");

let clockedIn = false;

chrome.storage.local.get(["startTime", "endTime"], (data) => {
  if (data.startTime && !data.endTime) {
    clockedIn = true;
    updateDisplay(data.startTime, null);
  } else if (data.startTime && data.endTime) {
    updateDisplay(data.startTime, data.endTime);
  }
  updateButton();
});

clockButton.addEventListener("click", () => {
  if (!clockedIn) {
    const now = new Date().toISOString();
    chrome.storage.local.set({ startTime: now, endTime: null }, () => {
      updateDisplay(now, null);
      clockedIn = true;
      updateButton();
    });
  } else {
    chrome.storage.local.get(["startTime"], (data) => {
      const endTime = new Date().toISOString();
      chrome.storage.local.set({ endTime: endTime }, () => {
        updateDisplay(data.startTime, endTime);
        clockedIn = false;
        updateButton();
      });
    });
  }
});

function updateButton() {
  clockButton.textContent = clockedIn ? "Clock Out" : "Clock In";
}

function updateDisplay(startTimeISO, endTimeISO) {
  startTimeEl.textContent = startTimeISO ? formatTime(startTimeISO) : "--";
  endTimeEl.textContent = endTimeISO ? formatTime(endTimeISO) : "--";

  if (startTimeISO && endTimeISO) {
    const start = new Date(startTimeISO);
    const end = new Date(endTimeISO);
    const total = Math.floor((end - start) / 1000);
    totalTimeEl.textContent = formatDuration(total);
  } else {
    totalTimeEl.textContent = "--";
  }
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}
