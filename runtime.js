chrome.runtime.onInstalled.addListener(runInstall);

chrome.runtime.onMessage.addListener(function(aRequest) {
	if ('type' in aRequest && aRequest.type == 'JIRA_ISSUE') {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'issue/' + encodeURIComponent(aRequest.key));
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var issue = JSON.parse(xhr.responseText);
				if (issue) {
					if(!(issue.errorMessages && issue.errorMessages.length)){
						addToHistory(issue);
					}
				}
			}
		};

		xhr.send();
	}
});