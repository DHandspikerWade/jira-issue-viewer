(function () {	
	var elements = document.getElementsByName('ajs-issue-key');
  	var i;
	
	if (elements) {
		for (i = 0;  i < elements.length; i++) {
			if (elements[i].tagName.toUpperCase() == 'META') {
				chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].content, visited: true});
				break;
			}
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
	
	var ghxView = document.querySelector('.ghx-detail-view');
	if (ghxView) {
		var currentIssue;
		var observer = new MutationObserver(function () {
			setTimeout(function() {
				var sidebar = document.querySelector('.ghx-detail-view');
				var detectedIssue;

				if (sidebar) {
					detectedIssue = sidebar.querySelector('.ghx-detail-issue');
					
					if (detectedIssue && detectedIssue.dataset.issuekey != currentIssue) {
						currentIssue = detectedIssue.dataset.issuekey;
						chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: currentIssue, visited: true});
					}
				}
			}, 1000);
		});
		
		observer.observe(ghxView, {
			childList: true,
			subtree: true
		});
	}
})();
