(function() {
	var mysql = require("mysql");
	var connection = null;
	var createTableSql = [
		"CREATE TABLE IF NOT EXISTS `%table%` (",
		"danmu_id int(11) NOT NULL AUTO_INCREMENT,",
		"danmu_user varchar(255) NOT NULL DEFAULT '',",
		"danmu_text text NOT NULL,",
		"danmu_publish int(11) NOT NULL DEFAULT '0',",
		"danmu_ip varchar(255) NOT NULL DEFAULT '',",
		"danmu_useragent text NOT NULL,",
		"PRIMARY KEY (danmu_id),",
		"KEY danmu_TPISC (danmu_publish)",
		") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;"
	].join("\n");

	var createDatabase = function(callback) {
		for (var room in config.rooms) {
			connection.query('SELECT 1 FROM `' + config.rooms[room].table + '`', function(err, rows) {
				if (err !== null) {
					log.log("Creating Table...");
					connection.query(createTableSql.replace(/%table%/g, config.rooms[room].table), function(err, rows) {
						callback(err);
					});
				} else {
					callback(null);
				}
			});
		}

	};

	module.exports = {
		init: function(callback) {
			connection = mysql.createConnection({
				host: config.database.server,
				user: config.database.username,
				password: config.database.password,
				//debug: true
			});
			connection.connect(function() {
				connection.query('USE ' + config.database.db, function(err, rows) {
					if (err !== null) {
						callback(err);
						return;
					}
					createDatabase(function(err) {
						callback(err);
					});
				});
			});

			coordinator.on("danmuTransfer", function(data) {
				var room = data.data.room;
				connection.query("INSERT INTO `%table%` (danmu_user, danmu_text, danmu_publish, danmu_ip, danmu_useragent) VALUES (?, ?, ?, ?, ?)".replace("%table%", config.rooms[room].table), [
					data.data.hash, data.data.text, Math.round(new Date().getTime() / 1000), data.data.ip, data.data.ua
				]);
			});

			coordinator.on("searchDanmu", function(data) {
				var room = data.data.room;
				connection.query('SELECT * from `%table%` where `danmu_text` LIKE ? LIMIT 20'.replace("%table%", config.rooms[room].table), [
					'%' + data.data.key + '%'
				], function(err, rows) {
					if (err === null) {
						var ret = [];
						ret = JSON.stringify(rows).replace(/"danmu_/g, '"');
						coordinator.emit("gotSearchDanmu", ret);
					} else {
						coordinator.emit("gotSearchDanmu", "");
					}

				});
			});
		}
	};

})();