/**
Optimizes simpleState.js by keeping a copy of the current **params** object,
and only calling update(params) where necessitated by changes in params properties.
*/
import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize,
    FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { fmt, fmtVector } from './utils.js'

const initialParams = {
    // Updating the FuelBed
    curedHerb: -1 ,
    // Updating the FuelIgnition
    moistureDead1h: 0.1,
    moistureDead10h: 0.1,
    moistureDead100h: 0.1,
    moistureLiveHerb: 3,
    moistureLiveStem: 3,
    // Updating the FireBehavior
    midflameWindSpeed: 0,
    windBearing: 0,
    slopeRatio: 0,
    aspect: 180,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
}

export class FuelModelFireTable {
    constructor(params=null) {
        this.#initClasses()
        if (params) this.update(params)
    }
    #initClasses() {
        this.params = {}
        this.fuelCatalog = new FuelModelCatalog()
        this.fuelIgnition = new FuelIgnition()
        this.fireBehavior = new FireBehavior()

        this.fuelModels = []
        this.fuelBeds = []
        for (let fuelKey of this.fuelCatalog.getNumberKeys()) {
            if (this.fuelCatalog.isBurnable(fuelKey)) {
                const fuelModel = this.fuelCatalog.get(fuelKey)
                const fuelBed = new FuelBed({fuelModel, ...initialParams})
                this.fuelModels.push(fuelModel)     // Array of references to FuelModels
                this.fuelBeds.push(fuelBed)
            }
        }
        this.update(initialParams)
    }

    isChanged(props) {
        for(let prop of props) {
            if (this.params[prop] !== this.prevParams[prop]) return true
        }
        return false
    }

    update(params) {
        this.prevParams = this.params
        this.params = params
        const results = []
        for (let fuelBed of this.fuelBeds) {
            let changed = false
            // Did the fuel curing fraction change
            if (this.isChanged(['curedHerb'])) {
                fuelBed.update({fuelModel: fuelBed.fuelModel, ...params})
                changed = true
            }
            if (changed || this.isChanged(['moistureDead1h', 'moistureDead10h', 'moistureDead100h',
                'moistureLiveHerb', 'moistureLiveStem'])) {
                this.fuelIgnition.update({fuelBed, ...params})
                changed = true
            }
            if (changed || this.isChanged(['midflameWindSpeed', 'windBearing', 'slopeRatio', 'aspect'])) {
                this.fireBehavior.update({fuelIgnition: this.fuelIgnition, ...params})
            }

            const {fuelModel} = fuelBed
            const {number, code} = fuelModel
            const {headingSpreadRate, flameLength} = this.fireBehavior
            results.push({number, code, headingSpreadRate, flameLength})
        }
        return results
    }
}

// ------------------------------------------------------

const start = performance.now()
const fmft = new FuelModelFireTable()
const results = fmft.update(initialParams)
const stop = performance.now()
console.log(results)
console.log(`fuelModelFireTable.js elapsed time: ${fmt(stop-start)} msec`)
