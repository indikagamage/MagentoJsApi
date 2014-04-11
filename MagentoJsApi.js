var Class = function(methods) {  
    var klass = function() {   
        this.initialize.apply(this, arguments);         
    }; 
    var property;
    for (property in methods) {
       klass.prototype[property] = methods[property];
    }
         
    if (!klass.prototype.initialize) klass.prototype.initialize = function(){};     
   
    return klass;   
};

MagentoJsApi = Class({
	modulesConfig: {
		'validate'	: {
			'active'	:	true,
			'version'	:	'1.0.0'
		},
	},
	initialize: function () {
	},
	
	Modules: {
		mergeModules: function (arguments) {
			var obj3 = {};
		
			for (var attrname in this.modulesConfig) { obj3[attrname] = this.modulesConfig[attrname]; }

			for(var key in arguments) {
	    		for (var attrname in arguments[key]) { obj3[attrname] = arguments[key][attrname]; }
			}
			console.table(obj3);
			return obj3;
		}
	},

	loadmodules: function () {
		console.log(this.Modules.mergeModules(arguments));
		// for(var key in this.modules) {
		// 	console.log(this.modules[key]);
		// }
		// for(var i=0; i<arguments.length; i++) {
		// 	console.log(this.modules);
	 //    	//alert("Hi, " + arguments[i]);
		// }
	}
});
var obj3 = {'validate'	:{
		'active'	:	false
	}};
var magentojsapi = new MagentoJsApi().loadmodules({
	'validate'	:{
		'active'	:	false
	}
});