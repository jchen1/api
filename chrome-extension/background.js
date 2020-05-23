"use strict";

const apiURL = "https://api.jeffchen.dev/";

function visited(url) {
  chrome.storage.sync.get({ token: "" }, ({ token }) => {
    if (token !== "" && url !== "") {
      const data = {
        event: "visited_url",
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

chrome.tabs.onCreated.addListener(({ url }) => visited(url));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    visited(changeInfo.url);
  }
});
