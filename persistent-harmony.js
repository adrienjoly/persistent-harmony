/**
 * persistent-harmony proxy
 * author: adrien joly
 * refs:
 * - http://wiki.ecmascript.org/doku.php?id=harmony:proxies
 * - http://crypticswarm.com/harmony-proxies-introduction
 **/

exports.makePHHandlers = function(o) {
	return {
		get: function(p, name){
			return o[name];
		},
		set: function(p, name, val) {
			return o[name] = val;
		},
		delete: function(name) {
			return delete o[name];
		},
		keys: function() {
			return Object.keys(o);
		},
		enumerate: function() {
			return Object.keys(o);
		},
		/*
		getOwnPropertyDescriptor: function(name) {
			return Object.getOwnPropertyDescriptor(o, name);
		},
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
}

exports.PHProxy = function(o) {
	return Proxy.create(exports.makePHHandlers(o), o);
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
