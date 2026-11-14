import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'
import { ParamsZero } from './Params.js'

export class FbfmFireCharTable {
    constructor(params=null) {
        // Start with full compliment of default parameters,
        // then over-write with any client-specific values
        this.params = {...ParamsZero, ...params}
        
        // Create and store the FuelModel, FuelBed, FuelIgnition, and FireBehavior for each fuelKey
        this.fuelCatalog = new FuelModelCatalog()
        this.fbfm = []
        for (let fuelKey of this.fuelCatalog.getNumberKeys()) {
            if (this.fuelCatalog.isBurnable(fuelKey)) {
                const isCurable = this.fuelCatalog.isCurable(fuelKey)
                const fuelModel = this.fuelCatalog.get(fuelKey)
                const fuelBed = new FuelBed({fuelModel, ...this.params})
                const fuelIgnition = new FuelIgnition({fuelBed, ...this.params})
                const fireBehavior = new FireBehavior({fuelIgnition, ...this.params})
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
                changed = true
            }

            // Update fireBehavior only if fuelBed or fuelIgnition has changed
            // or if any of the wind-slope input parameters have changed
            if (changed || this.isChanged(['midflameWindSpeed', 'windBearing', 'slopeRatio', 'aspect'])) {
                fireBehavior.update({fuelIgnition, ...params})
            }

            const {headingSpreadRate, flameLength} = fireBehavior
            results.push({number: number, code, ros: headingSpreadRate, flame: flameLength, changed})
        }
        return results
    }
}
