const clockButton = document.getElementById("clockButton");
const startTimeEl = document.getElementById("startTime");
const endTimeEl = document.getElementById("endTime");
const totalTimeEl = document.getElementById("totalTime");
const historyList = document.getElementById("historyList");

let clockedIn = false;

chrome.storage.local.get(["startTime", "endTime", "history"], (data) => {
  if (data.startTime && !data.endTime) {
    clockedIn = true;
    updateDisplay(data.startTime, null);
  } else if (data.startTime && data.endTime) {
    updateDisplay(data.startTime, data.endTime);
  }
  if (data.history) {
    renderHistory(data.history);
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
    chrome.storage.local.get(["startTime", "history"], (data) => {
      const endTime = new Date().toISOString();
      const startTime = data.startTime;
      const session = {
        start: startTime,
        end: endTime,
        duration: calculateDuration(startTime, endTime)
      };

      let history = data.history || [];
      history.unshift(session); // Add new session to the beginning
      if (history.length > 5) {
        history = history.slice(0, 5); // Keep only the last 5
      }

      chrome.storage.local.set({ endTime: endTime, history: history }, () => {
        updateDisplay(startTime, endTime);
        renderHistory(history);
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
    const total = calculateDuration(startTimeISO, endTimeISO);
    totalTimeEl.textContent = total;
  } else {
    totalTimeEl.textContent = "--";
  }
}

function renderHistory(history) {
  historyList.innerHTML = "";
  history.forEach((session, index) => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <strong>Session ${index + 1}</strong><br>
      In: ${formatTime(session.start)}<br>
      Out: ${formatTime(session.end)}<br>
      Total: ${session.duration}
    `;
    historyList.appendChild(item);
  });
}

function calculateDuration(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const total = Math.floor((end - start) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
