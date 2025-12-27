// CONFIGURATION
const ALARM_NAME = "log_it_reminder";
const TIMER_MINUTES = 60; // <--- CHANGE THIS NUMBER (e.g., 30, 60, 15)

chrome.runtime.onInstalled.addListener(() => {
  console.log("Log It: Installed");
  // Create the alarm
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: TIMER_MINUTES,
    periodInMinutes: TIMER_MINUTES 
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Show the Notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Log It.",         // <--- THIS IS THE NOTIFICATION TITLE
      message: "What have you been working on?",
      priority: 2
    });
  }
});

// Reset alarm if the browser restarts
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: TIMER_MINUTES,
    periodInMinutes: TIMER_MINUTES
  });
});