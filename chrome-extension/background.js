"use strict";

const apiURL = "https://api.jeffchen.dev/";

function sendEvent(url, event) {
  chrome.storage.sync.get({ token: "" }, ({ token }) => {
    if (token !== "" && url !== "") {
      const data = {
        event,
        source: {
          major: "chrome-extension",
          minor: "v0.1",
        },
        type: "text",
        data: url,
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
