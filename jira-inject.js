(function () {	
	var elements = document.getElementsByName('ajs-issue-key');
	if (elements) {
		for (var i = 0;  i < elements.length; i++) {
			if (elements[i].tagName.toUpperCase() == 'META') {
				chrome.runtime.sendMessage({ type: "JIRA_ISSUE", key: elements[i].content });
				break;
			}
		}
	}
})();