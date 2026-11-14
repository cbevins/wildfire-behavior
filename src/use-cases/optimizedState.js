import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'

export const OptimizedStateParams = {
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

export class OptimizedState {
    constructor(params=null) {
        // Start with full compliment of default parameters,
        // then over-write with any client-specific values
        this.params = {...OptimizedStateParams, ...params}
        
        this.fuelCatalog = new FuelModelCatalog()
        this.fuelIgnition = new FuelIgnition()
        this.fireBehavior = new FireBehavior()

        this.fuelModels = []
        this.fuelBeds = []
        for (let fuelKey of this.fuelCatalog.getNumberKeys()) {
            if (this.fuelCatalog.isBurnable(fuelKey)) {
                const fuelModel = this.fuelCatalog.get(fuelKey)
                const fuelBed = new FuelBed({fuelModel, ...this.params})
                this.fuelModels.push(fuelModel)     // Array of references to FuelModels
                this.fuelBeds.push(fuelBed)
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
