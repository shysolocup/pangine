var { wc, bot } = require('../../../index.js');


const engineConfig = require('./engineConfig.json');
const { Soup, Stew, Noodle } = require('stews');



class Pangine {
    constructor() {

        let compiles = Soup.from(engineConfig.compile);
        compiles = compiles.map( (call, dir) => {
	        return wc.compile(dir, null, (path, file, compiled, name) => { 
                compiled.push(name, require(`../${path}/${file}`)); 
            });
        });

        var { classes, data } = compiles;
        var { storage } = data;
        var { ID, Lobby } = classes;

        this.StorageID = new ID();
        storage.push(this.StorageID, compiles);
        this.Lobby = Lobby;

        return this;
    }


    get storage() {
        return storage.get(this.StorageID);
    }
}


// Function Maker
class WCFunctionMaker {
    constructor(name, func) {
        var stuff = (func instanceof Function) ? func : function() { return func; }

        Object.defineProperty(stuff, "name", { value: name });
        Object.defineProperty( WillClient.prototype, name, { value: stuff });

        return stuff;
    }
}


Object.defineProperties(WillClient, {
    "Function": { value: WCFunctionMaker }, "function": { value: WCFunctionMaker },
    "Func": { value: WCFunctionMaker }, "func": { value: WCFunctionMaker}
});



// Property Maker
class PanginePropertyMaker {
    constructor(name, value, attributes={set:undefined, enumerable:false, configurable:false}) {
        var func = (value instanceof Function) ? value : function() { return value; };
        
        Object.defineProperty(func, "name", { value: name });
        Object.defineProperty(Pangine.prototype, name, {
            get: func,
            set: attributes.set,
            enumerable: attributes.enumerable,
            configurable: attributes.configurable
        });

        return func;
    }
}


Object.defineProperties(Pangine, {
    "Property": { value: PanginePropertyMaker }, "property": { value: PanginePropertyMaker },
    "Prop": { value: PanginePropertyMaker }, "prop": { value: PanginePropertyMaker }
});



module.exports = Pangine
