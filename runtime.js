//chrome.runtime.onInstalled.addListener(runInstall);

chrome.runtime.onMessage.addListener(function(aRequest, aSender, aSendResponse) {
	if ('type' in aRequest) {
        if (aRequest.type == 'JIRA_ISSUE') {
            var updateHistory = function () {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'issue/' + encodeURIComponent(aRequest.key));
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var issue = JSON.parse(xhr.responseText);
                        if (issue) {
                            if (!(issue.errorMessages && issue.errorMessages.length)) {
                                addToHistory(issue, null, !aRequest.visited);
                            }
                        }
                    }
                };

                xhr.send();
            }

            if (aRequest.visited) {
                updateHistory();
            } else {
                getDatabase().query('SELECT id FROM `issue` WHERE `issue_key` = ? LIMIT 1', [aRequest.key], function (aTrans, aResults) {
                    if (!aResults.rows.length) {
                        updateHistory();
                    }
                });
            }

        } else if (aRequest.type == 'BUG_REPORT') {
            aSendResponse(('notificationId' in aRequest && aRequest.notificationId in _jiraViewer.errors) ? _jiraViewer.errors[aRequest.notificationId] : null);
        }

	}
});