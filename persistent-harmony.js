/**
 * persistent-harmony proxy
 * author: adrien joly
 * refs:
 * - http://wiki.ecmascript.org/doku.php?id=harmony:proxies
 * - http://crypticswarm.com/harmony-proxies-introduction
 **/

var LOAD = 0, SET = 1, DELETE = 2;
var FCT_NAME = ["load", "set", "delete"];

exports.PHProxy = function(db) {

	var self = this;
	var p = p || {};
	this.db = db;
	this.q = {}; // colName -> transaction queue

	this.wrap = function(colName, o, cb) {
		var o = o || {};
		function populateFields(cursor, cb){
			cursor.next(function(field){
				if (!field)
					process.nextTick(cb);
				else {
					o[field._id] = field.v;
					populateFields(cursor, cb);
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



/*
function Log(handler, id) {
	return Proxy.create({
		get: function(_, name) {
			console.log(id + " -> " + name);
			return handler[name];
		}
	});
}
*/

/*
exports.PHProxy = function(o) {
	return Proxy.create(exports.makePHHandlers(o), o);
}
exports.LoggedPH = function(o) {
	var handlers = exports.makePHHandlers(o);
	var realPH = Proxy.create(handlers, o); //exports.PHProxy(o, handlers);
	Object.keys(handlers).map(function(method){
		var realMethod = handlers[method];
		handlers[method] = function(a,b,c) {
			console.log("   [proxy]", method);
			return realMethod(a,b,c);
		}
	});
	return realPH;
}
*/