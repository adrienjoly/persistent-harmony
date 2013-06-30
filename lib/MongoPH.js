var mongodb = require("mongodb");
var ph = require("./persistent-harmony.js");

var BATCH_SIZE = 100;
var FETCH_OPTS = {batchSize: BATCH_SIZE};
var DB_OPTS = {native_parser:false, strict:true, safe:true};
var SERVER_OPTS = {auto_reconnect:true};

function makeCursor(col, cb, cb2){
	col.find({}, FETCH_OPTS, function(err, cursor){
		if (err) throw err;
		cb({
			next: function(handler) {
				cursor.nextObject(function(err, item) {
					if (err) throw err;
					handler(item);
				});
			}
		}, cb2);
	});
}

/**
 * db layer for a mongodb database.
 * p  <- { dbname, dbhost, dbport }
 * cb -> { load(), set(), delete() }
 **/
exports.MongoConnector = function(p, cb) {

	var self = this;
	this.collections = {};

	var p = p || {};
	var dbName = p.dbname || "local";
	var host = p.dbhost || process.env['MONGO_NODE_DRIVER_HOST'] || 'localhost';
	var port = p.dbport || process.env['MONGO_NODE_DRIVER_PORT'] || mongodb.Connection.DEFAULT_PORT;

	console.log("Connecting to MongoDB/"+dbName+" @ " + host + ":" + port + "...");
	var db = new mongodb.Db(dbName, new mongodb.Server(host, port, SERVER_OPTS), DB_OPTS);
	db.addListener('error', function(e){
		console.log("MongoDB model async error: ", e);
	});

	this.load = function(colName, cb, cb2) {
		var col = self.collections[colName];
		if (col)
			makeCursor(col, cb, cb2);
		else
			db.createCollection(colName, function(err, col) {
				if (err) throw err;
				self.collections[colName] = col;
				makeCursor(col, cb, cb2);
			});
	}

	this.set = function(colName, field, value, cb) {
		self.collections[colName].update({_id: field}, {$set:{v:value}}, {upsert:true}, function(err, res){
			if (err) throw err;
			cb && cb();
		});
	}

	this.delete = function(colName, field, cb) {
		self.collections[colName].remove({_id: field}, function(err, res){
			if (err) throw err;
			cb();
		});
	}

	db.open(function(err, db) {
		if (err) throw err;
		console.log("Successfully connected to MongoDB/"+dbName+" @ " + host + ":" + port);
		db.collections(function(err, collections) {
			if (err) throw err;
			(function next(){
				var colName = (collections.shift() || {}).collectionName;
				if (!colName)
					cb && cb(self);
				else
					db.collection(colName, function(err, col) {
						console.log(" - found table: " + colName);
						self.collections[colName] = col;
						next();
					});
			})();
		});
	});
}

exports.MongoPH = function(p, cb) {
	new exports.MongoConnector(p, function(db){
		cb(new ph.PHProxy(db));
	});
}

