function DatabaseConnection (aDatabase, aInitializeCallback, aDescription, aSize) {
	var cSelf = this;
	var db = openDatabase(aDatabase, '', aDescription || (aDatabase + 'v' + aVersion) , aSize || (4 * 1024 * 1024));

	var isReady = false, upgrading = false;
	var quene = [];

	this.isReady = function() { return isReady;};

	this.setVersion = function (aNewVersion, aUpgradeCallback) {
		if (aNewVersion && db.version != aNewVersion) {
			upgrading = true;
			console.debug('Database versions do not match. Upgrading version "' + db.version + '" to "' + aNewVersion + '".');

			db.changeVersion(db.version, aNewVersion, function () {
				if (aUpgradeCallback && typeof aUpgradeCallback == 'function') {
					aUpgradeCallback(cSelf, db.version);
				} else {
					console.warn('No callback provided to upgrade database.');
				}
			}, function () {
				throw "Database upgrade failed.";
			}, function () {
				if (aUpgradeCallback && typeof aUpgradeCallback == 'function')
					console.debug('Database is upgrading.');
			});
		}

		return this;
	};

	this.query = function (aSql, aParameters, aSuccess, aFailed) {
		if (isReady && !upgrading) {
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
		aTrans.executeSql('SELECT "confirmed";', [], function (aTrans) {
			console.debug("Database initialization complete");

			if (!upgrading) {
				isReady = true;
				for (var index in quene) {
					aTrans.executeSql(quene[index].sql, quene[index].parameters, quene[index].success, quene[index].failed);
					delete quene[index];
				}
			}


		}, function () {
			throw "Database initialization failed";
		});

	});
}