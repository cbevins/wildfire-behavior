/**
 * The FuelModelCatalog provides a mechanism for getting a FuelModel reference from a fuel model number or code.
 * 
 * The get(fuelKey) method argument may be either:
 * - the FuelModel.number (i.e., 1-13, 91-93, 98, 99, 101-109, 121-124, 141-149, 161-165, 181-189, 201-204), or
 * - the FuelModel.code (i.e. '1'-'13', 'nb1'-'nb3', 'nb8', 'nb9', 'gr1'-'gr9', 'gs1'-'gs4',
 * 'sh1'-'sh9', 'tu1'-'tu5', 'tl1'-'tl9', 'sb1'-'sb4')
 * An error is thrown if 'fuelKey' does not exist in the catalog.
 * 
 * The has(fuelKey) method should be used to test for the existence of uncertain fuelKeys.
 * 
 * The set(fuelKey, fuelModel) method is used to add custom fuel models to the catalog.
*/
import { FuelModels } from "./FuelModels.js"

export class FuelModelCatalog {
    constructor() {
        this.catalog = new Map()
        for(let model of FuelModels) {
            this.catalog.set(model.number, model)
            this.catalog.set(model.code.toLowerCase(), model)
        }
    }

    // Ensures all string keys are lower case
    #toKey(key) {
        return (typeof key === 'string') ? key.toLowerCase() : key
    }

    // Returns a reference to the fuel model, or throws an error
    get(fuelKey) {
        const fuelModel = this.catalog.get(this.#toKey(fuelKey)) 
        if (fuelModel === undefined) 
            throw new Error(`FuelModelCatalog.get() fuel key '${fuelKey}' is invalid.`)
        return fuelModel
    }

    // Returns an array of all the particle curing classes
    getCuringClasses(fuelKeys=[]) {
        const {curing} = this.#getParticleClasses(fuelKeys)
        return [...curing]
    }

    // Returns an array of all unique numeric fuel keys
    getNumberKeys() {
        const keys = new Set()
        for (const key of this.catalog.keys()) {
            if(Number.isFinite(key)) keys.add(key)
        }
        return [...keys]
    }

    // Returns an array of all the particle moisture classes
    getMoistureClasses(fuelKeys=[]) {
        const {moisture} = this.#getParticleClasses(fuelKeys)
        return [...moisture]
    }

    // Returns a {curing, moisture} object, where:
    // 'curing' is a Set() of all defined particle curing classes, and
    // 'moisture' is a Set() of all defined fuel moisture classes
    #getParticleClasses(fuelKeys=[]) {
        const curing = new Set()
        const moisture = new Set()
        for (let key of fuelKeys) {
            const fuelModel = this.catalog.get(key)
            for (let particle of fuelModel.particles) {
                moisture.add(particle.deadMoistureClass)
                moisture.add(particle.liveMoistureClass)
                curing.add(particle.curingClass)
            }
        }
        return {moisture, curing}
    }

    // Returns an array of all unique fuel model string keys
    getStringKeys() {
        const keys = new Set()
        for (const key of this.catalog.keys()) {
            if(typeof key === 'string') keys.add(key)
        }
        return [...keys]
    }

    /**
     * @param {number|string} fuelKey A fuelKey number or string
     * @returns TRUE if the fuelKey exists in the catalog, FALSE if it doesn't exist
     */
    has(fuelKey) {
        return this.catalog.has(this.#toKey(fuelKey))
    }

    isBurnable(fuelKey) {
        const fuelModel = this.get(fuelKey)
        for(let particle of fuelModel.particles) {
            if(particle.ovendryLoad > 0) 
                return true
        }
        return false
    }

    isCurable(fuelKey) {
        const fuelModel = this.get(fuelKey)
        for(let particle of fuelModel.particles) {
            if (particle.life === "curable") 
                return true
        }
        return false
    }

    /**
     * Adds a custom fuel model to the catalog.
     * CAUTION: There is no testing for the validity of the 'fuelModel' object!
     * The fuelModel is added twice to the catalog, once under the fuelModel.number
     * and once under the fuelModel.code.
     * @param {object} FuelModel plain-old data object
     * @returns Reference to *this* FuelModelCatalog (and NOT to the catalog Map())
     */
    set(fuelModel) {
        this.catalog.set(fuelModel.code.toLowerCase(), fuelModel)
        this.catalog.set(fuelModel.number, fuelModel)
        return this
    }
}
