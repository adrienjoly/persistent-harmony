var mongodb = require("mongodb");

var LOAD = 0, SET = 1, DELETE = 2;

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

	this.load = function(colName, cb) {
		if (self.collections[colName])
			cb();
		else
			db.createCollection(colName, function(err, result) {
				if (err) throw err;
				self.collections[colName] = result;
				nextTransaction();
			});
		// TODO: populate object from db data
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
						cb && cb();
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

var FCT_NAME = ["load", "set", "delete"];

exports.MongoPH = function(p) {

	var self = this;
	var isReady = false;
	var p = p || {};
	this.proxies = {}; // table-name -> proxy
	this.q = {}; // colName -> transaction queue

	function buildHandlers (colName, o) {
		var o = o || {};
		//var col = self.collection[colName];
		self.q[colName] = [[LOAD]];
		/*var col;
		db.collection(colName, function(err, result) {
			col = result;
			console.log("col", err , result);
		});*/
		return {
			get: function(p, f){
				return o[f];
			},
			set: function(p, f, val) {
				//col.update({_id: f}, {$set:{v:val}});
				self.q[colName].push([SET, f, val]);
				return o[f] = val;
			},
			delete: function(f) {
				//col.remove({_id: f});
				self.q[colName].push([DELETE, f]);
				return delete o[f];
			},
			keys: function() {
				return Object.keys(o);
			},
			enumerate: function() {
				return Object.keys(o);
			}
		};
	};

	function pump() {
		console.log("(pump)"/*, self.q*/);
		var cols = Object.keys(self.q);
		(function nextCollection(){
			var colName = cols.shift();
			if (!colName)
				setTimeout(pump, 1000);
			else
				(function nextTransaction(){
					var t = self.q[colName].shift();
					if (t) {
						var fct = FCT_NAME[t.shift()];
						console.log("(pump) -", colName, fct, [colName].concat(t).concat(nextTransaction));
						self.db[fct].apply(self.db, [colName].concat(t).concat(nextTransaction));
					}
					else
						nextCollection();
					/*else if (t[0] == SET)
						self.collections[colName].update({_id: t[1]}, {$set:{v:t[2]}}, {upsert:true}, function(err, res){
							if (err) throw err;
							nextTransaction();								
						});
					else if (t[0] == DELETE)
						self.collections[colName].remove({_id: t[1]}, function(err, res){
							if (err) throw err;
							nextTransaction();								
						});
					else if (t[0] == INIT && !self.collections[colName])
						db.createCollection(colName, function(err, result) {
							if (err) throw err;
							self.collections[colName] = result;
							// TODO: populate object from db data
							nextTransaction();
						});
					else
						nextTransaction();*/
				})();
		})();
	}

	this.wrap = function(name, o) {
		return this.proxies[name] = Proxy.create(buildHandlers(name, o), o || {});
	};

	this.whenReady = function(cb) {
		if (isReady)
			cb(self);
		else
			var interval = setInterval(function(){
				if (isReady) {
					clearInterval(interval);
					cb(self);
				}
			}, 200);
	};

	// db init

	this.db = new exports.MongoConnector(p, function(){
		isReady = true;
		console.log("MongoDB is ready!");
		pump();
	});

}

