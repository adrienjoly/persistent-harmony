/**
 * persistent-harmony proxy
 * author: adrien joly
 * ref: http://wiki.ecmascript.org/doku.php?id=harmony:proxies
 **/

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
		},
		enumerate: function() {
			//console.log("   [proxy] enumerate");
			var r = [];
			for (var n in o)
				r.push(n);
			return r;
		},
		keys: function() {
			//console.log("   [proxy] keys");
			return Object.keys(o);
		}
	};
 }

 exports.PHProxy = function(o, handlers) {
	return Proxy.create(handlers || exports.makePHHandlers(o), o);
}
