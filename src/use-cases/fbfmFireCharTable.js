/**
fbfmFireCharTable.js produces a table of heading spread rate, direction, and flame length
for the 53 'standard' fire behavior fuel models (13 per Anderson and 40 per Scott & Burgan)
under a set of curing, moisture, wind, and slope conditions.

The table is suitable for creating a 'fire behavior characteristics chart', where each
fuel model is plotted on a chart with fire spread rate on the x-axis and
flame length on the y-axis.

It also demonstrates some optimizations,
- The FuelModel - FuelBed pairs are pre-constructued for all 53 fuel models.
- The fbfmFireCharTable instance keeps a copy of the current input parameters.
- fuelBed.update() is only called if the FuelModel has curable herb
    and the 'curedHerb' input parameter has changed.
- fuelIgnition.update() is only called when the fuel model moisture content input
parameter has changed for one (or more) of its existing fuel moisture classes.
- fireBehavior.update() is only called if one of the wind speed, direction, slope,
    or aspect input parameters have changed.
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

export class FbfmFireCharTable {
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
        this.params = {...params}
        const results = []
        for (const {isCurable, fuelModel, fuelBed, fuelIgnition, fireBehavior} of this.fbfm) {
            let changed = false

            // Update fuelBed only if the curing fraction has changed
            // Only 17 of the 53 standard FBFM have curable fuel.
            if (isCurable && this.isChanged(['curedHerb'])) {
                fuelBed.update({fuelModel, ...params})
                changed = true
            }

            // Update fuelIgnition only if the fuelBed has been updated
            // or its has a fuel particle whose moisture content has changed
            if (changed
                    // All 53 standard FBFM utilize the 1-h dead fuel moisture
                    || (fuelBed.moistureClasses.has('moistureDead1h') && this.isChanged(['moistureDead1h']))
                    // 43 standard FBFM utilize the 1-0h dead fuel moisture
                    || (fuelBed.moistureClasses.has('moistureDead10h') && this.isChanged(['moistureDead10h']))
                    // 32 standard FBFM utilize the 100-h dead fuel moisture
                    || (fuelBed.moistureClasses.has('moistureDead100h') && this.isChanged(['moistureDead100h']))
                    // 17 standard FBFM utilize the live herb fuel moisture
                    || (fuelBed.moistureClasses.has('moistureLiveHerb') && this.isChanged(['moistureLiveHerb']))
                    // 23 standard FBFM utilize the live stem fuel moisture
                    || (fuelBed.moistureClasses.has('moistureLiveStem') && this.isChanged(['moistureLiveStem']))) {
                fuelIgnition.update({fuelBed, ...params})
                changed = true
            }

            // Update fireBehavior only if fuelBed or fuelIgnition has changed
            // or if any of the wind-slope input parameters have changed
            if (changed || this.isChanged(['midflameWindSpeed', 'windBearing', 'slopeRatio', 'aspect'])) {
                fireBehavior.update({fuelIgnition, ...params})
            }

            const {number, code} = fuelModel
            const {headingSpreadRate, flameLength} = fireBehavior
            results.push({number: fmt(number), code, ros: fmt(headingSpreadRate), flame: fmt(flameLength), changed})
        }
        return results
    }
}

// ------------------------------------------------------
function changed(results) {
    let nChanged = 0
    for(let result of results) {
        if (result.changed) nChanged++
    }
    return nChanged
}

function example() {
    const start = performance.now()

    const fmft = new FbfmFireCharTable()
    // let results = fmft.update(initialParams)
    // console.log('Initial Params', fmft.params)
    // console.log('Initial Results', results)

    // Change curedHerb
    const params = {...fmft.params}
    params.curedHerb = 0.5
    let results = fmft.update(params)
    console.log('After curedHerb=0.5', fmft.params)
    console.log('Results After', results)
    console.log('Number of FuelBeds changed by curedHerb:', changed(results))

    params.moistureDead100h = 0.09
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead100h:', changed(results))

    params.moistureDead10h = 0.07
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead10h:', changed(results))

    params.moistureDead1h = 0.05
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead1h:', changed(results))

    params.moistureLiveHerb = 0.5
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureLiveHerb:', changed(results))

    params.moistureLiveStem = 1.5
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureLiveStem:', changed(results))

    const stop = performance.now()
    console.log(`fbfmFireCharTable.js elapsed time: ${fmt(stop-start)} msec`)
}

example()