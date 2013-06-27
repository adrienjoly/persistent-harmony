/**
 * persistent-harmony proxy
 * author: adrien joly
 * refs:
 * - http://wiki.ecmascript.org/doku.php?id=harmony:proxies
 * - http://crypticswarm.com/harmony-proxies-introduction
 **/

function Log(handler, id) {
	return Proxy.create({
		get: function(_, name) {
			console.log(id + " -> " + name);
			return handler[name];
		}
	});
}

 exports.makePHHandlers = function(o) {
	return {
		get: function(p, name){
			//console.log("   [proxy] get field:", name);
			return o[name];
		},
		set: function(p, name, val) {
			//console.log("   [proxy] set field:", name);
			return o[name] = val;
		},
		delete: function(name) {
			//console.log("   [proxy] delete field:", name);
			return delete o[name];
		},
		keys: function() {
			//console.log("   [proxy] keys");
			return Object.keys(o);
		},
		enumerate: function() {
			//console.log("   [proxy] enumerate");
			/*
			var r = [];
			for (var n in o)
				r.push(n);
			return r;*/
			return Object.keys(o);
		},
		/*
		getOwnPropertyDescriptor: function(name) {
			//console.log("   [proxy] getOwnPropertyDescriptor:", name);
			return Object.getOwnPropertyDescriptor(o, name);
		},
		getPropertyDescriptor: function(name) {
			//console.log("   [proxy] getPropertyDescriptor:", name);
			return Object.getPropertyDescriptor(o, name);
		},
		getOwnPropertyNames: function() {
			//console.log("   [proxy] getOwnPropertyNames");
			return Object.getOwnPropertyNames(o);
		},
		getPropertyNames: function() {
			//console.log("   [proxy] getPropertyNames");
			return Object.getPropertyNames(o);
		},
		fix: function() {
			//console.log("   [proxy] fix");
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
			//console.log("   [proxy] has:", name);
			return name in o;
		},
		hasOwn:function(name) {
			//console.log("   [proxy] hasOwn:", name);
			return ({}).hasOwnProperty.call(o, name);
		},*/
	};
 }

 exports.PHProxy = function(o, handlers) {
 	var handlers = handlers || exports.makePHHandlers(o);
	return Proxy.create(handlers, o);
}
/* WORK IN PROGRESS
 exports.PHProxy = function(o, params) {
 	var params = params || {};
 	var handlers = exports.makePHHandlers(o);
 	if (params.)
	return Proxy.create(handlers, o);
} */

exports.LoggedPH = function(o) {
	var handlers = exports.makePHHandlers(o);
	var realPH = exports.PHProxy(o, handlers);
	Object.keys(handlers).map(function(method){
		var realMethod = handlers[method];
		handlers[method] = function(a,b,c) {
			console.log("   [proxy]", method);
			return realMethod(a,b,c);
		}
	});
	return realPH;
}


