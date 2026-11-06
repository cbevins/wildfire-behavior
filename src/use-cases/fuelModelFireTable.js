/**
fuelModelFireTable.js produces a table of heading spread rate, direction, and flame length
for all 13 Anderson and 40 Scott & Burgan fuel models
under a set of curing, moisture, wind, and slope conditions.
*/
import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'
import { fmt } from './utils.js'

const initialParams = {
    // Updating the FuelBed
    curedHerb: 0,
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
        this.params = initialParams
        this.fuelCatalog = new FuelModelCatalog()
        this.fbfm = []
        for (let fuelKey of this.fuelCatalog.getNumberKeys()) {
            if (this.fuelCatalog.isBurnable(fuelKey)) {
                const isCurable = this.fuelCatalog.isCurable(fuelKey)
                const fuelModel = this.fuelCatalog.get(fuelKey)
                const fuelBed = new FuelBed({fuelModel, ...initialParams})
                const fuelIgnition = new FuelIgnition({fuelBed, ...initialParams})
                const fireBehavior = new FireBehavior({fuelIgnition, ...initialParams})
                this.fbfm.push({fuelKey, isCurable, fuelModel, fuelBed, fuelIgnition, fireBehavior})
            }
        }
        this.update(this.params)
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
        for (const {isCurable, fuelModel, fuelBed, fuelIgnition, fireBehavior} of this.fbfm) {
            let changed = false
            if (isCurable && this.isChanged(['curedHerb'])) {
                fuelBed.update({fuelModel, ...params})
                changed = true
            }
            if (changed || this.isChanged(['moistureDead1h', 'moistureDead10h', 'moistureDead100h',
                'moistureLiveHerb', 'moistureLiveStem'])) {
                fuelIgnition.update({fuelBed, ...params})
                changed = true
            }
            if (changed || this.isChanged(['midflameWindSpeed', 'windBearing', 'slopeRatio', 'aspect'])) {
                fireBehavior.update({fuelIgnition, ...params})
            }

            const {number, code} = fuelModel
            const {headingSpreadRate, flameLength} = fireBehavior
            results.push({number: fmt(number), code, ros: fmt(headingSpreadRate), flame: fmt(flameLength)})
        }
        return results
    }
}

// ------------------------------------------------------

const start = performance.now()

const fmft = new FuelModelFireTable()


let fuelModel = fmft.fuelCatalog.get(101)
let fuelBed = new FuelBed({fuelModel, curedHerb: 0})

let results = fmft.update(initialParams)
console.log('Before', fmft.params)
console.log('Results Before', results)

results = fmft.update(initialParams)
console.log('After', fmft.params)
console.log('Results After', results)

const stop = performance.now()
console.log(`fuelModelFireTable.js elapsed time: ${fmt(stop-start)} msec`)
