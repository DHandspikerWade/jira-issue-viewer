var _jiraViewer = window._jiraViewer || {
	'baseUrl': -1,
	'jiraSiteId': -1,
	'apiPath' : 'rest/api/2/',
	'timeoutId': null
};

chrome.storage.sync.get('baseUrl', function(aData) {
	var db = getDatabase()
	_jiraViewer.baseUrl = aData.baseUrl;
	db.transaction(function (aTrans) {
		aTrans.executeSql('SELECT id from `jira_site` WHERE url = ?;', [_jiraViewer.baseUrl], function(aTrans, aResults) {
			if (aResults.rows.length > 0) {
				_jiraViewer.jiraSiteId = aResults.rows.item(0).id;
			}
		}, sqlError);
	});
});

function getDatabase() {
	return openDatabase('jiraIssueHistory', '1.0', 'History of issue keys found in JIRA', 2 * 1024 * 1024);
}

function runInstall() {
	var db = getDatabase();

	db.transaction(function (aTrans) {
		//Create tables
		aTrans.executeSql('CREATE TABLE IF NOT EXISTS `issue` ( `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `issue_key`	TEXT NOT NULL, `summary` TEXT, `jira_site_id` INTEGER NOT NULL, `updated_datetime` DATETIME NOT NULL);');
		aTrans.executeSql('CREATE TABLE IF NOT EXISTS`jira_site` (`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `url` TEXT NOT NULL);');
		
	});

	//Add JIRA Site if exists
	chrome.storage.sync.get({baseUrl: ''}, 
		function(items) {
			db.transaction(function (aTrans) {
				aTrans.executeSql('SELECT id from `jira_site` WHERE url = ?;', [items.baseUrl], function(aTrans, aResults) {
					if (aResults.rows.length > 0) {
						_jiraViewer.jiraSiteId = aResults.rows.item(0).id;
					} else {
						aTrans.executeSql('INSERT INTO `jira_site` (url) VALUES (?);', [items.baseUrl], function(aTrans, aResults) {
							_jiraViewer.jiraSiteId = aResults.insertId;
						}, sqlError);
					}
				}, sqlError);

				_jiraViewer.baseUrl = items.baseUrl;
			});
	});
}

function sqlError(tx, e) {
	console.error(e);
	alert("There has been an error: " + e.message);
}


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

function addToHistory(aIssue, aOldIssue) {
	if (!aOldIssue) aOldIssue = aIssue; //Fallback 

	setTimeout(function() {
		var key = aIssue.key;
		var db = getDatabase();

		db.transaction(function (aTrans) {
			aTrans.executeSql('SELECT id FROM `issue` WHERE issue_key = ?;',[key], function(aTrans, aResults) {
				if (aResults.rows.length < 1) {
					aTrans.executeSql('INSERT INTO `issue` (`issue_key`, `summary`, `jira_site_id`, `updated_datetime`) VALUES (?, ?, ?, DateTime("now"))', [
						key,
						aIssue.fields.summary,
						_jiraViewer.jiraSiteId
					], function(){}, sqlError);
				} else if(aResults.rows.length == 1) {
					aTrans.executeSql('UPDATE `issue` SET `issue_key` = ?, `summary` = ?, `jira_site_id` = ?, `updated_datetime` = DateTime("now") WHERE id = ?;', [
						key,
						aIssue.fields.summary,
						_jiraViewer.jiraSiteId,
						aResults.rows.item(0).id
					], function(){}, sqlError);
				}
			}, sqlError);
		});
	}, 10);
}