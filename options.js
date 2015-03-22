function saveOptions() {
  var baseUrl = document.getElementById('baseUrl').value;

  if(baseUrl.charAt(baseUrl.length - 1) !== "/") baseUrl += '/';
  if (baseUrl.indexOf("http") !== 0) baseUrl = 'http://' + baseUrl;

  document.getElementById('baseUrl').value = baseUrl;

  chrome.storage.sync.set({
      baseUrl: baseUrl,
    }, 
    function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.innerHTML = '';
    }, 1200);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
      baseUrl: ''
    }, 
    function(items) {
      document.getElementById('baseUrl').value = items.baseUrl;
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);