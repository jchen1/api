// Saves options to chrome.storage
function save_options() {
  const token = document.getElementById("token").value;
  const source = document.getElementById("source").value;

  chrome.storage.sync.set(
    {
      token,
      source,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      status.textContent = "Options saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 750);
    },
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      token: "",
      source: "",
    },
    function (items) {
      document.getElementById("token").value = items.token;
      document.getElementById("source").value = items.source;
    },
  );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
