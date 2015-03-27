var _jiraViewer = {
	'baseUrl': -1,
	'apiPath' : 'rest/api/2/',
	'_found' : []
};
chrome.storage.sync.get('baseUrl', function(aData) {
	_jiraViewer.baseUrl = aData.baseUrl;
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if ('baseUrl' in changes) {
		_jiraViewer.baseUrl = changes['baseUrl'].newValue;
	}
});

chrome.omnibox.onInputChanged.addListener(function(aText, aSuggest) {
	//TODO search by key

	// var xhr = new XMLHttpRequest();
	// xhr.onreadystatechange = jiraResponse;
	// xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'search/?jql=' + encodeURIComponent(aText));
	// xhr.send();
});

chrome.omnibox.onInputEntered.addListener(redirectToJira);

function redirectToJira(aText) {
	if (_jiraViewer.baseUrl === -1) {
		setTimeout(function () {
			redirectToJira(aText);
		}, 20);
	} else {
		if (!_jiraViewer.baseUrl || _jiraViewer.baseUrl == 'http:///') {
			alert('Please set the base URL in JIRA Viewer options before using.');
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'issue/' + encodeURIComponent(aText));
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var response = JSON.parse(xhr.responseText);
				if (response) {
					if(response.errorMessages && response.errorMessages.length){

					}else {
						addToHistory(aText);
						chrome.tabs.update({url: _jiraViewer.baseUrl + 'browse/' + aText});
					}
				}
			} else if(xhr.readyState == 4) {
				chrome.tabs.update({
					url: _jiraViewer.baseUrl + 'issues/?jql=' + encodeURIComponent('text ~ "' + aText +'"')
				});
			}
		};
		xhr.send();
	}
}

function addToHistory(aKey) {

}
