MagentoJsApi.loadModule({
	'jquery': {
		active: true,
		outscript: '/js/ceicom/jquery.min.js'
	},
	'validate': {
    	active: true,
    	source: {
    		getModuleName: function () {
    			return 'validate';
    		}
    	}
    }
});

MagentoJsApi.addModule({
	'jquery-mask': {
		active: true,
		outscript: '/js/ceicom/jquery.mask.min.js'
	}
});
