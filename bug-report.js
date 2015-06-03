if (!window.location.hash) {
    window.close();
}

chrome.runtime.sendMessage({type: 'BUG_REPORT', notificationId: window.location.hash.substring(1)}, function(aResponse) {
    if (aResponse == null) {
        window.close();
        return;
    }

    window._errorData = aResponse;
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('report-form').onsubmit = function(aEvent) {
        var formData = new FormData(this);
        formData.append('data', JSON.stringify(window._errorData));

        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://spikedhand.com/support.php');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {

            }
        };

        xhr.send(formData);

        return false;
    };
});


