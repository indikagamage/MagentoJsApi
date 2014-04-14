var MagentoJsApi = (function () {
	var	modules = {
	    'validate': {
	    	active: true,
	    	version: '1.0.0',
	    	source: ''
	    },
	    'report': {
	    	active: true,
	    	version: '1.0.0',
	    	source: ''
	    },
	    'jquery': {
	    	active: true,
	    	version: '1.11.0',
	    	outscript: ''
	    }
  	};
 
  	function doSomethingPrivate() {
    	//...
  	}

  	function verifiKeyExist() {
  		var args = Array.prototype.slice.call(arguments),
     	obj = args.shift();

  		for (var i = 0; i < args.length; i++) {
    		if (!obj.hasOwnProperty(args[i])) {
      			return false;
    		}
    		obj = obj[args[i]];
  		}
  		return true;
  	}

  	function verifyChanges (module) {
  		if ( typeof module === "object" ) {
		  	for(var key in module) {
				if((verifiKeyExist(modules,key))&&(typeof module[key] === "object")){
					for(var keyconf in module[key]) {
						if ((verifiKeyExist(modules,key,keyconf))&&(typeof module[key][keyconf] != "undefined")) {
							modules[key][keyconf] = module[key][keyconf];
						}
					}
				}
			}
		}
  	}

  	function extendModule ( scope, module, name) {
  		if (module.active == true) {
		    for (var property in module) {
		    	if(property == 'source'){
		    		scope[name] = module[property];
		    	}else if(property == 'outscript'){
		    		getOutSctipt(module[property]);
		    	}
		    }
  		}
	}

	function getOutSctipt (url) {
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= url;
        head.appendChild(script);
		console.log(url);
	}
 
	// Return an object exposed to the public
	return {
	 
	    // Add items to our basket
	    addModule: function( newModule ) {
	    	for(var key in newModule) {
	    		if ((!verifiKeyExist(modules,key))&&(newModule[key].active == true)) {
	    			modules[key] = newModule[key];
	    			extendModule(this, newModule[key], key);
	    		}
	    	}
	    },
	 
	    // Public alias to a  private function
	    doSomething: doSomethingPrivate,

	    // override the current modules
		loadModule: function( modulesLoaded ) {
			verifyChanges(modulesLoaded);
			for(var key in modulesLoaded) {
				extendModule(this, modulesLoaded[key], key);
			}
		},

		getModules: function () {
			return modules;
		}
	};
})();
