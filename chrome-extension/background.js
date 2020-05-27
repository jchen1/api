"use strict";

const apiURL = "https://api.jeffchen.dev/";

function sendEvent(urlOrId, event) {
  chrome.storage.sync.get({ token: "" }, ({ token }) => {
    if (token !== "" && urlOrId !== "") {
      const data = {
        event,
        source: {
          major: "chrome-extension",
          minor: "v0.1",
        },
        type: typeof urlOrId === "string" ? "text" : "int",
        data: urlOrId,
      };
      return fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    }
  });
}

chrome.tabs.onCreated.addListener(({ url }) => sendEvent(url, "visited_url"));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    sendEvent(changeInfo.url, "visited_url");
  }
});

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  chrome.tabs.get(tabId, tab => {
    sendEvent(tab.url, "switched_tab");
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  sendEvent(tabId, "closed_tab");
});

chrome.windows.onCreated.addListener(window =>
  sendEvent(window.id, "opened_window")
);
chrome.windows.onRemoved.addListener(windowId =>
  sendEvent(windowId, "closed_window")
);
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId >= 0) {
    sendEvent(windowId, "switched_window");
  }
});
