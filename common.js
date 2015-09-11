var _jiraViewer = window._jiraViewer || {
	'baseUrl': -1,
	'jiraSiteId': -1,
	'apiPath' : 'rest/api/2/',
    'databaseVersion': 2,
	'timeoutId': null,
    'errors': {}
};

chrome.storage.sync.get('baseUrl', function(aData) {
	var db = getDatabase();
	_jiraViewer.baseUrl = aData.baseUrl;
	db.query('SELECT id from `jira_site` WHERE url = ?;', [_jiraViewer.baseUrl], function(aTrans, aResults) {
		if (aResults.rows.length > 0) {
			_jiraViewer.jiraSiteId = aResults.rows.item(0).id;
		}
	}, sqlError);
});

var getDatabase = (function() {
    var dbInstance = null;

    return function () {
        if (dbInstance === null) {
            var initialize = function (aTrans) {
                //Create tables
                aTrans.executeSql('CREATE TABLE IF NOT EXISTS `issue` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `issue_key` TEXT NOT NULL, `summary` TEXT, `jira_site_id` INTEGER NOT NULL, `updated_datetime` DATETIME NOT NULL);');
                aTrans.executeSql('CREATE TABLE IF NOT EXISTS`jira_site` (`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `url` TEXT NOT NULL);');
            };

            dbInstance = new DatabaseConnection('jiraIssueHistory', initialize, 'History of issue keys found in JIRA');

            dbInstance.setVersion(_jiraViewer.databaseVersion);
        }

        return dbInstance;
    }
})();

var isDebug = (function() {
    var status = !('update_url' in chrome.runtime.getManifest());

    return function() {
        return status;
    };
})();

function sqlError(tx, e) {
	handleError(e);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if ('baseUrl' in changes) {
		_jiraViewer.baseUrl = changes['baseUrl'].newValue;
        if (_jiraViewer.baseUrl && _jiraViewer.baseUrl.toString().trim()) {
			var db = getDatabase();

			db.query('SELECT id from `jira_site` WHERE url = ?;', [_jiraViewer.baseUrl], function(aTrans, aResults) {
				if (aResults.rows.length > 0) {
					_jiraViewer.jiraSiteId = aResults.rows.item(0).id;
				} else {
					aTrans.executeSql('INSERT INTO `jira_site` (url) VALUES (?);', [_jiraViewer.baseUrl], function(aTrans, aResults) {
						_jiraViewer.jiraSiteId = aResults.insertId;
					}, sqlError);
				}
			}, sqlError);
        } else {
        	_jiraViewer.jiraSiteId = -1;
        }
	}
});

function addToHistory(aIssue, aOldIssue, aScraped) {
	if (!aOldIssue) aOldIssue = aIssue; //Fallback

	setTimeout(function() {
        try {
            var key = aIssue.key;
            var db = getDatabase();

                db.query('SELECT id FROM `issue` WHERE issue_key = ?;', [key], function (aTrans, aResults) {
                	var datetimeSql = (aScraped) ? "DateTime(0, 'unixepoch')": 'DateTime("now")';

                    if (aResults.rows.length < 1) {
                        aTrans.executeSql('INSERT INTO `issue` (`issue_key`, `summary`, `jira_site_id`, `updated_datetime`) VALUES (?, ?, ?, ' + datetimeSql + ')', [
                            key,
                            aIssue.fields.summary,
                            _jiraViewer.jiraSiteId
                        ], function () {
                        }, sqlError);
                    } else if (aResults.rows.length == 1 && !aScraped) {
                        aTrans.executeSql('UPDATE `issue` SET `issue_key` = ?, `summary` = ?, `jira_site_id` = ?, `updated_datetime` = DateTime("now") WHERE id = ?;', [
                            key,
                            aIssue.fields.summary,
                            _jiraViewer.jiraSiteId,
                            aResults.rows.item(0).id
                        ], null, sqlError);
                    }
                }, sqlError);
        } catch (aEx) {
            handleError(aEx);
        }
	}, 10);
}

function escapeXml(aUnsafe) {
    return aUnsafe.replace(/[<>&'"]/g, function (aChar) {
        switch (aChar) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function handleError(aException, aData) {
    var notificationId = 'jira-viewer' + Date.now();
    var notification = {
        type: 'basic',
        title: 'An error has occurred!',
        message: 'JIRA Issue Viewer has run into an unexpected error.',
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAABHCAMAAABRVbUkAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAP1BMVEUAAAD//9uQOgAAAAAAOpDb///bkDoAAGa2/////7ZmAAAAZrb/25A6AAA6kNv/tmYAADqQ2/+2ZgBmtv////8DxwXgAAAAAXRSTlMAQObYZgAAAAFiS0dEFJLfyTUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADtSURBVEjH1ZXbCsIwEAWj9X6L1v//V19KO4GJB0QQ97Xb7swhzZby9Vqth6k2W3u+G5baH9693/nE8YSGs0y4XNFwk4aK5/fHB4xlDIyNhCE0Es8goQg1IDQSFlMjYQiU0JgooYyUUARKWExkVAQyKgIZNSYyKgIZLSYGrYyUUARKaEyUUARIOAIkNCZKKAIlNCZKKCMkHAESfnXUgEAJRYCExwQJR4CExwQJR6gBARIeEyQcARIeEySccZHoIMwWPuBPatLsOaYc490T98wYGpotYQ2coAxcAnpciKCaiTHuwnw/xn9mHvKj4/YC29QOsCTc4s4AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDYtMDNUMDA6NTM6MDkrMDI6MDAgFY33AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA2LTAzVDAwOjUzOjA5KzAyOjAwUUg1SwAAAABJRU5ErkJggg=='
    };

    if (!isDebug() || ('forceDialog' in aData)) {
        notification['contextMessage'] = 'Would you like to submit a bug report?';
        notification['buttons'] = [
            {
                title: 'Submit Bug Report'
            },
            {
                title: 'Not Now'
            }
        ];
    }

    chrome.notifications.create(notificationId, notification, function(aValue){}); //Callback is required
    _jiraViewer.errors[notificationId] = {
        date: (new Date()).toUTCString(),
        version: chrome.runtime.getManifest()['version'],
        os: null,
        arch: null,
        extraData: aData
    };

    if (aException) {
        _jiraViewer.errors[notificationId].errorMessage = aException.message;
        _jiraViewer.errors[notificationId].errorName = aException.name;
        if ('lineNumber' in aException) _jiraViewer.errors[notificationId].line = aException.lineNumber;
        if ('fileName' in aException) _jiraViewer.errors[notificationId].fileName = aException.fileName;
        if ('stack' in aException) _jiraViewer.errors[notificationId].stackTrace = aException.stack;
    }

    chrome.runtime.getPlatformInfo(function(aPlatformInfo) {
        _jiraViewer.errors[notificationId].os = aPlatformInfo.os;
        _jiraViewer.errors[notificationId].arch = aPlatformInfo.arch;
    });
}


chrome.notifications.onButtonClicked.addListener(function(aNotificationId, aButtonId) {
    if (aButtonId === 0) {
       var appWindow = chrome.windows.create({
            url: chrome.runtime.getURL('bug-report.html') + '#' + aNotificationId,
            type: 'popup',
            focused: true,
            width: 360,
            height: 350
        });

    } else if (aButtonId === 1) {
        delete _jiraViewer.errors[aNotificationId];
    }

    chrome.notifications.clear(aNotificationId, function(){});
});