/**
Given a set of fire behavior input parameters, FbfmRosWindTable produces a table
of heading spread rate under midflame wind speed of 0-20 mph for the
53 'standard' fire behavior fuel models (13 per Anderson and 40 per Scott & Burgan).


Like the FbfmFireCharTable class, this also demonstrates some optimizations,
- The FuelModel - FuelBed pairs are pre-constructued for all 53 fuel models.
- The fbfmFireCharTable instance keeps a copy of the current input parameters.
- fuelBed.update() is only called if the FuelModel has curable herb
    and the 'curedHerb' input parameter has changed.
- fuelIgnition.update() is only called when the fuel model moisture content input
parameter has changed for one (or more) of its existing fuel moisture classes.
*/
import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'
import { fmt } from './utils.js'

const initialParams = {
    // Updating the FuelBed
    curedHerb: 0.778,
    // Updating the FuelIgnition
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    // Updating the FireBehavior
    midflameWindSpeed: 0,
    windBearing: 90,
    slopeRatio: 0.25,
    aspect: 180,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
}

export class FbfmRosWindTable {
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

    update(params, range={min:0, max: 20, step:1}, prop='headingSpreadRate') {
        this.prevParams = this.params
        this.params = {...params}
        const results = []
        for (const {isCurable, fuelModel, fuelBed, fuelIgnition, fireBehavior} of this.fbfm) {
            const {number, code} = fuelModel
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
            }

            // Loop for each midflame wind speed
            let values = []
            for(let mws=range.min; mws<=range.max; mws+=range.step) {
                fireBehavior.update({fuelIgnition, ...params, midflameWindSpeed: mws*88})
                values.push(fmt(fireBehavior[prop]))
            }

            results.push({number: fmt(number), code, prop, values})
        }
        return results
    }
}

// ------------------------------------------------------

function example() {
    const start = performance.now()
    const fmft = new FbfmRosWindTable()
    let rosTable = fmft.update(initialParams)
    let flTable = fmft.update(initialParams, {min:0, max:20, step:1}, 'flameLength')
    const stop = performance.now()
    console.log(rosTable)
    console.log(flTable)
    console.log(`fbfmRosWindTable.js elapsed time: ${fmt(stop-start)} msec`)
}

example()