var _jiraViewer = window._jiraViewer || {
	'baseUrl': -1,
	'jiraSiteId': -1,
	'apiPath' : 'rest/api/2/',
	'timeoutId': null
};

chrome.storage.sync.get('baseUrl', function(aData) {
	_jiraViewer.baseUrl = aData.baseUrl;

});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if ('baseUrl' in changes) {
		_jiraViewer.baseUrl = changes['baseUrl'].newValue;

		var db = getDatabase();

		db.transaction(function (aTrans) {
			aTrans.executeSql('SELECT id from `jira_site` WHERE url = ?;', [_jiraViewer.baseUrl], function(aTrans, aResults) {
				if (aResults.rows.length > 0) {
					_jiraViewer.jiraSiteId = aResults.rows.item(0).id;
				} else {
					aTrans.executeSql('INSERT INTO `jira_site` (url) VALUES (?);', [_jiraViewer.baseUrl], function(aTrans, aResults) {
						_jiraViewer.jiraSiteId = aResults.insertId;
					}, sqlError);
				}
			}, sqlError);
		});
	}
});

chrome.omnibox.onInputChanged.addListener(function(aText, aSuggest) {
	chrome.omnibox.setDefaultSuggestion({"description" : "Search Jira for " + aText});

	clearTimeout(_jiraViewer.timeoutId);

	_jiraViewer.timeoutId = setTimeout(function() {
		getDatabase().transaction(function (aTrans) {
			aTrans.executeSql('SELECT issue_key, summary FROM `issue` WHERE issue_key LIKE "%" || ? || "%" ORDER BY updated_datetime LIMIT 10;',[aText], function(aTrans, aResults) {
				var len = aResults.rows.length, i, suggestions = [];
				for (i = 0; i < len; i++) {
					suggestions.push({
						'content': aResults.rows.item(i).issue_key,
						'description': aResults.rows.item(i).issue_key + ': ' + aResults.rows.item(i).summary
					});
				}

				aSuggest(suggestions);
			}, sqlError);
		});
	}, 400);
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

		aText = aText.trim();

		var xhr = new XMLHttpRequest();
		xhr.open("GET", _jiraViewer.baseUrl + _jiraViewer.apiPath + 'issue/' + encodeURIComponent(aText));
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var response = JSON.parse(xhr.responseText);
				if (response) {
					if(response.errorMessages && response.errorMessages.length){
						//Not handling errors yet!
					}else {
						chrome.tabs.update({url: _jiraViewer.baseUrl + 'browse/' + aText});
						addToHistory(response);
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
	return false;
}

function addToHistory(aIssue) {
	setTimeout(function() {
		var key = aIssue.key;
		var db = getDatabase();

		db.transaction(function (aTrans) {
			aTrans.executeSql('SELECT id FROM `issue` WHERE issue_key = ?;',[key], function(aTrans, aResults) {
				if (aResults.rows.length < 1) {
					aTrans.executeSql('INSERT INTO `issue` (`issue_key`, `summary`, `jira_site_id`, `updated_datetime`) VALUES (?, ?, ?, DateTime("now"))', [
						key,
						aIssue.fields.summary,
						-1
					], function(){}, sqlError);
				} else if(aResults.rows.length == 1) {
					aTrans.executeSql('UPDATE `issue` SET `issue_key` = ?, `summary` = ?, `jira_site_id` = ?, `updated_datetime` = DateTime("now") WHERE id = ?;', [
						key,
						aIssue.fields.summary,
						-1,
						aResults.rows.item(0).id
					], function(){}, sqlError);
				}
			}, sqlError);
		});
	}, 10);
}
