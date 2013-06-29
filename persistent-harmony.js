/**
 * persistent-harmony proxy
 * author: adrien joly
 * refs:
 * - http://wiki.ecmascript.org/doku.php?id=harmony:proxies
 * - http://crypticswarm.com/harmony-proxies-introduction
 **/

var LOAD = 0, SET = 1, DELETE = 2;
var FCT_NAME = ["load", "set", "delete"];

exports.PHProxy = function(db, p) {

	var self = this;
	var p = p || {};
	this.db = db;
	this.q = {}; // colName -> transaction queue

	this.addWrapper = function(fct) {
		(p.wrappers = p.wrappers || []).push(fct);
	}

	this.wrap = function(colName, o, cb) {
		var o = o || {};
		function populateFields(cursor, cb2){
			cursor.next(function(field){
				if (!field) {
					process.nextTick(cb2); // process next db action from queue
					cb && process.nextTick(cb); // notify caller of wrap()
				}
				else {
					o[field._id] = field.v;
					populateFields(cursor, cb2);
				}
			});
		}
		this.q[colName] = [[LOAD, populateFields]];
		var handlers = {
			get: function(p, f){
				return o[f];
			},
			set: function(p, f, val) {
				self.q[colName].push([SET, f, val]);
				return o[f] = val;
			},
			delete: function(f) {
				self.q[colName].push([DELETE, f]);
				return delete o[f];
			},
			keys: function() {
				return Object.keys(o);
			},
			enumerate: function() {
				return Object.keys(o);
			},

			// required when trying to console.log(proxy) after 2 seconds of tests
			getOwnPropertyDescriptor: function(name) {
				return Object.getOwnPropertyDescriptor(o, name);
			},
			/*
			getPropertyDescriptor: function(name) {
				return Object.getPropertyDescriptor(o, name);
			},
			getOwnPropertyNames: function() {
				return Object.getOwnPropertyNames(o);
			},
			getPropertyNames: function() {
				return Object.getPropertyNames(o);
			},
			fix: function() {
				if (Object.isFrozen(o)) {
					var result = {};
					Object.getOwnPropertyNames(o).forEach(function(name) {
						result[name] = Object.getOwnPropertyDescriptor(o, name);
					});
					return result;
				}
				// As long as obj is not frozen, the proxy won't allow itself to be fixed
				return undefined; // will cause a TypeError to be thrown
			},
			has: function(name) {
				return name in o;
			},
			hasOwn:function(name) {
				return ({}).hasOwnProperty.call(o, name);
			},*/
		};
		for (var i in p.wrappers)
			handlers = p.wrappers[i](handlers);
		return Proxy.create(handlers, o);
	};

	(function pump() {
		var cols = Object.keys(self.q);
		(function nextCollection(){
			var colName = cols.shift();
			if (!colName)
				setTimeout(pump, 1000);
			else
				(function nextTransaction(){
					var t = self.q[colName].shift();
					if (!t)
						process.nextTick(nextCollection);
					else {
						var fct = FCT_NAME[t.shift()], args = [colName].concat(t);
						console.log("(pump) -", colName, fct, args);
						self.db[fct].apply(self.db, args.concat(nextTransaction));
					}
				})();
		})();
	})();

	return this;
}

// Utility functions

var fakeDb = {
	load: function(colName, cb, cb2) { cb2(); },
	set: function(colName, f, v, cb) { cb(); },
	delete: function(colName, f, cb) { cb(); }
};

function Log(handler, id) {
	var id = id || "(proxy logger)";
	return Proxy.create({
		get: function(_, name) {
			console.log(id + " -> " + name);
			return handler[name];
		}
	});
}

exports.LoggedPH = function(o) {
	return (new exports.PHProxy(fakeDb, {wrappers:[Log]})).wrap("", o);
};
