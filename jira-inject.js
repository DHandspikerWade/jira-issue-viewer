(function () {	
	var elements = document.getElementsByName('ajs-issue-key');
	if (elements) {
		for (var i = 0;  i < elements.length; i++) {
			if (elements[i].tagName.toUpperCase() == 'META') {
				chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].content, visited: true});
				break;
			}
		}
	}

	elements = document.querySelectorAll('body.page-type-dashboard .issue-link[data-issue-key]');
	if (elements.length) {;
		for (i = 0; i < elements.length; i++) {
			chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].dataset.issueKey, visited: false});
		}
	}
})();