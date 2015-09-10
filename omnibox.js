
chrome.omnibox.onInputChanged.addListener(function (aText, aSuggest) {
    aText = aText.trim();
	chrome.omnibox.setDefaultSuggestion({"description" : "Search Jira for " + aText});

	clearTimeout(_jiraViewer.timeoutId);

	_jiraViewer.timeoutId = setTimeout(function() {
		getDatabase().query('SELECT issue_key, summary FROM `issue` WHERE issue_key LIKE "%" || ? || "%" ORDER BY updated_datetime DESC LIMIT 5;',[aText], function(aTrans, aResults) {
			var len = aResults.rows.length, 
                i, description, position, issue_key,
                suggestions = [];

			for (i = 0; i < len; i++) {
                issue_key = escapeXml(aResults.rows.item(i).issue_key);
                position = issue_key.toLowerCase().indexOf(aText.toLowerCase());

                if (position > -1) {
                    issue_key = issue_key.substring(0, position) 
                        + '<match>' + issue_key.substring(position, position + aText.length) + '</match>'
                        + issue_key.substring(position + aText.length);
                }

                description = issue_key + ': ';
                description += '<dim>' + escapeXml(aResults.rows.item(i).summary) + '</dim>';

				suggestions.push({
					'content': aResults.rows.item(i).issue_key,
					'description': description
				});
			}

			aSuggest(suggestions);
		}, sqlError);
	}, 400);
});

chrome.omnibox.onInputEntered.addListener(redirectToJira);

function redirectToJira(aText) {
    try {
        if (isDebug() && aText == 'error') {
            handleError(new Error(), {forceDialog: true});
            return;
        }

        if (_jiraViewer.baseUrl === -1) {
            setTimeout(function () {
                redirectToJira(aText);
            }, 20);
        } else {
            if (!_jiraViewer.baseUrl || _jiraViewer.baseUrl == 'http:///') {
                alert('Please set the base URL in JIRA Viewer options before using.');
				chrome.tabs.create({url: 'chrome://extensions/?options=' + chrome.runtime.id});
                return;
            }

            aText = aText.trim();

            var xhr = new XMLHttpRequest();
            xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'issue/' + encodeURIComponent(aText));
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response) {
                        if (response.errorMessages && response.errorMessages.length) {
                            handleError(new Exception('Jira returned errors.'), {errorMessages: response.errorMessages});
                        } else {
                            chrome.tabs.update({url: _jiraViewer.baseUrl + 'browse/' + aText});
                            addToHistory(response);
                        }
                    }
                } else if (xhr.readyState == 4) {
                    chrome.tabs.update({
                        url: _jiraViewer.baseUrl + 'issues/?jql=' + encodeURIComponent('text ~ "' + aText + '"')
                    });
                }
            };
            xhr.send();
        }

    } catch (aEx) {
        handleError(aEx);
        throw aEx;
    }
	return false;
}
