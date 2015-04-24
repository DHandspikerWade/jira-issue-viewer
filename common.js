function getDatabase() {
	return openDatabase('jiraIssueHistory', '1.0', 'History of issue keys found in JIRA', 2 * 1024 * 1024);
}

function runInstall() {
	var db = getDatabase();

	db.transaction(function (aTrans) {
		//Create tables
		//TODO preserve data over updates
		aTrans.executeSql('CREATE TABLE `issue` ( `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `issue_key`	TEXT NOT NULL, `summary` TEXT, `jira_site_id` INTEGER NOT NULL, `updated_datetime` DATETIME NOT NULL);');
		aTrans.executeSql('CREATE TABLE `jira_site` (`id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `url` TEXT NOT NULL);');
	});

	//Add JIRA Site if exists
	chrome.storage.sync.get({baseUrl: ''}, 
		function(items) {
			db.transaction(function (aTrans) {
				if (items.baseUrl) {
					aTrans.executeSql('INSERT INTO `jira_site` (url) VALUES (?)', [items.baseUrl]);
				}
			});
	});
}

function sqlError(tx, e) {
	console.error(e);
	alert("There has been an error: " + e.message);
}