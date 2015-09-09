function DatabaseConnection (aDatabase, aVersion, aInitializeCallback, aDescription, aSize) {
	var db = openDatabase(aDatabase, aVersion, aDescription || (aDatabase + 'v' + aVersion) , aSize || (4 * 1024 * 1024));

	var isReady = false;
	var quene = [];

	this.isReady = function() { return isReady;};

	this.query = function (aSql, aParameters, aSuccess, aFailed) {
		if (isReady) {
			db.transaction(function (aTrans) {
				aTrans.executeSql(aSql, aParameters, aSuccess, aFailed);
			});
		} else {
			quene.push({
				'sql': aSql, 
				'parameters': aParameters, 
				'success': aSuccess, 
				'failed': aFailed
			});
		}
	};

	//Initialize data before processing the quene
	db.transaction(function (aTrans) {
		if (aInitializeCallback && typeof aInitializeCallback == 'function') {
			aInitializeCallback(aTrans);
		}

		//Last transaction to confirm all other transactions have suceeded
		aTrans.executeSql('SELECT "comfirmed";', [], function (aTrans) {
			console.debug("Database initialization complete");

			isReady = true;
			for (index in quene) {
				aTrans.executeSql(quene[index].sql, quene[index].parameters, quene[index].success, quene[index].failed);
				delete quene[index];
			}


		}, function () {
			throw "Database initialization failed";
		});

	});
}