var _jiraViewer = {
	'baseUrl': null,
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

chrome.omnibox.onInputStarted.addListener(function(aText, aSuggest) {
	_jiraViewer._found = [];
	
});

chrome.omnibox.onInputChanged.addListener(function(aText, aSuggest) {
	//TODO search by key

	// var xhr = new XMLHttpRequest();
	// xhr.onreadystatechange = jiraResponse;
	// xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'search/?jql=' + encodeURIComponent(aText));
	// xhr.send();
});

chrome.omnibox.onInputEntered.addListener(function(aText, aSuggest) {
	if (aText === 'base') {
		chrome.tabs.update({url: _jiraViewer.baseUrl});
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
});

function jiraResponse () {
	
}

function addToHistory(aKey) {

}