chrome.tabs.onUpdated.addListener(function(aId, aInfo, aTab) {
	if (_jiraViewer && _jiraViewer.baseUrl !== -1) {
		if ('status' in aInfo && aInfo.status == 'complete') {
			if ('url' in aTab && aTab.url.indexOf(_jiraViewer.baseUrl) === 0) {
				chrome.tabs.executeScript(aId, {
					file: 'jira-inject.js'
				});
			}
		}
	}
});

