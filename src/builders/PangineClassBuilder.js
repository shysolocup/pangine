function PangineClassBuilder(c) {
	
	// Function Maker
	class PangineFunctionMaker {
    	constructor(name, func) {
	        var stuff = (func instanceof Function) ? func : function() { return func; }
	
	        Object.defineProperty(stuff, "name", { value: name });
	        Object.defineProperty( c.prototype, name, { value: stuff });
	
	        return stuff;
	    }
	}

	
	// Property Maker
	class PanginePropertyMaker {
	    constructor(name, value, attributes={set:undefined, enumerable:false, configurable:false}) {
	        var func = (value instanceof Function) ? value : function() { return value; };
	        
	        Object.defineProperty(func, "name", { value: name });
	        Object.defineProperty(c.prototype, name, {
	            get: func,
	            set: attributes.set,
	            enumerable: attributes.enumerable,
	            configurable: attributes.configurable
	        });
	
	        return func;
	    }
	}

	
	Object.defineProperties(c, {
	    "Function": { value: PangineFunctionMaker }, "function": { value: PangineFunctionMaker },
	    "Func": { value: PangineFunctionMaker }, "func": { value: PangineFunctionMaker}
	});

	Object.defineProperties(c, {
	    "Property": { value: PanginePropertyMaker }, "property": { value: PanginePropertyMaker },
	    "Prop": { value: PanginePropertyMaker }, "prop": { value: PanginePropertyMaker }
	});

	
	return c;
}



module.exports = PangineClassBuilder;
