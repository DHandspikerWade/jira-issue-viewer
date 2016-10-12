(function () {	
	var elements = document.querySelectorAll('.issue-header .issue-link[data-issue-key]');
  	var i;
	
	if (elements) {
		for (i = 0;  i < elements.length; i++) {
			chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i]..dataset.issueKey, visited: true});
			break;
		}
	}

	elements = document.querySelectorAll('body.page-type-dashboard .issue-link[data-issue-key]');
	if (elements.length) {
		for (i = 0; i < elements.length; i++) {
			chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].dataset.issueKey, visited: false});
		}
	}
	
	elements = document.querySelectorAll('body[class*="ghx-plan-band"] .ghx-issue-content .js-key-link');
	if (elements.length) {
		for (i = 0; i < elements.length; i++) {
			chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].title, visited: false});
		}
	}
	
	setInterval(function() {
		elements = document.querySelectorAll('body[class*="ghx-plan-band"] .ghx-detail-view .ghx-detail-issue');
		if (elements.length) {
			for (i = 0; i < elements.length; i++) {
				chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].dataset.issuekey, visited: true});
			}
		}
	}, 15000);
})();
