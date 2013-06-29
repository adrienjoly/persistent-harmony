var mongodb = require("mongodb");
var ph = require("./persistent-harmony.js");

var BATCH_SIZE = 100;

exports.MongoConnector = function(p, cb) {

	var self = this;
	var p = p || {};
	this.collections = {};

	var dbName = p.dbname || "local";
	var host = p.dbhost || process.env['MONGO_NODE_DRIVER_HOST'] || 'localhost';
	var port = p.dbport || process.env['MONGO_NODE_DRIVER_PORT'] || mongodb.Connection.DEFAULT_PORT;

	console.log("Connecting to MongoDB/"+dbName+" @ " + host + ":" + port + "...");

	var dbserver = new mongodb.Server(host, port, {auto_reconnect:true});
	var db = new mongodb.Db(dbName, dbserver, {native_parser:false, strict:true, safe:true});

	db.addListener('error', function(e){
		console.log("MongoDB model async error: ", e);
	});

	this.ObjectID = db.bson_serializer.ObjectID;

	this.ObjectId = function(v) {
		try {
			return this.ObjectID.createFromHexString(v);
		}
		catch (e) {
			console.error(e, e.stack);
			return "invalid_id";
		}
	};

	function makeCursor(col, cb, cb2){
		col.find({}, {batchSize: BATCH_SIZE}, function(err, cursor){
			if (err) throw err;
			cb({
				next: function(handler) {
					cursor.nextObject(function(err, item) {
						if (err) {
							//handler({error:err});
							throw err;
						}
						else
							handler(item /*, item ? next : undefined*/);
					});
				}
			}, cb2);
		});
	}

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
			if (err)
				console.log("MongoDB Error : " + err);
			else 
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
		//console.log("MongoDB is ready!");
		cb(new ph.PHProxy(db));
	});
}

