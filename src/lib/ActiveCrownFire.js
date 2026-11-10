import { FuelBed } from './FuelBed.js'
import { FuelIgnition } from './FuelIgnition.js'
import { FireBehavior } from './FireBehavior.js'
import { CrownFireFuelModel } from "./FuelModels.js"

export class CanopyFuelBed extends FuelBed {
    constructor() {
        super({fuelModel: CrownFireFuelModel, curedHerb: 0})
    }
}

// params must have {fuelBed, moistureDead1h, etc}
export class CanopyFuelIgnition extends FuelIgnition {
    constructor(params=null) {
        super(params)
    }
}

export const ActiveCrownFireBehaviorProps = [
        {key: 'fireBehavior', type: 'FireBehavior', init: {}, desc: ''},
        {key: 'headingSpreadRate', type: 'fireRos', init: 0, desc: 'Active crown fire spread rate'},
        {key: 'heatPerUnitArea', type: 'fireHpua', init: 0, desc: 'Active crown fire sum of surface and crown fuel heats per unit area'},
        {key: 'firelineIntensity', type: 'fireFli', init: 0, desc: 'Active crown fire fireline intensity'},
        {key: 'flameLength', type: 'fireFl', init: 0, desc: 'Active crown fire flame length'},
        {key: 'powerOfFire', type: 'power', init: 0, units: 'ft-lb/ft2/s', desc: "Rothermel's power-of-the-fire"},
        {key: 'powerOfWind', type: 'power', init: 0, units: 'ft-lb/ft2/s', desc: "Rothermel's power-of-the-wind"},
        {key: 'powerRatio', type: 'ratio', init: 0, desc: ''},
        {key: 'isPlumeDominated', type: '', init: 0, desc: ''},
        {key: 'isWindDriven', type: '', init: 0, desc: ''},
]

export class ActiveCrownFireBehavior {
    constructor(params=null) {
        this.#init()
        this.fireBehavior = new FireBehavior()  // used only for crown fire spread rate and hpua
        if (params) this.update(params)
    }

    #init() {
        for(let {key, init} of ActiveCrownFireBehaviorProps)
            this[key] = init 
    }

    checkParams(params) {
        console.log('checkParams', params)
        for(let prop of ['canopyFuelIgnition', 'windSpeed20ft', 'canopyFuelHpua', 'surfaceFuelHpua']) {
            if (! Object.hasOwn(params, prop))
                throw new Error(`ActiveCrownFireBehavior.update(params) requires a 'params.${prop}' property`)
        }
    }

    /**
     * 
     * @param {object} params Object with props:
     *  - canopyFuelIgnition:  reference to a **Canopy**FuelIgnition object to determine canopy spread rate
     *  - windSpeed20ft: wind speed at canopy top (ft/min)
     *  - surfaceFuelHpua: surface fuel heat per unit area (Btu/ft2)
     *  - canopyFuelHpua: canopy fuel heat per unit area (Btu/ft2)
     */
    update(params) {
        // Either throw an error if missing parameters
        this.checkParams(params)
        // or assign defaults of zero
        const { canopyFuelIgnition, windSpeed20ft=0, surfaceFuelHpua=0, canopyFuelHpua=0 } = params

        // Use the **crown's internal** fuel model 10 to determine active crown fire spread rate
        // using wind speed at 20-ft and no slope:
        this.fireBehavior.update({...params, fuelIgnition: canopyFuelIgnition,
            midflameWindSpeed: windSpeed20ft, slopeRatio: 0, limitWindSpeedFactor: false})
        // Rothermel's crown fire spread rate (ft/min)
        this.headingSpreadRate = 3.34 * this.fireBehavior.headingSpreadRate

        // Active crown fire heat per unit area is the **sum** of the surface and canopy fuel HPUA
        // and IS NOT the fuel model 10 HPUA.
        this.heatPerUnitArea = surfaceFuelHpua + canopyFuelHpua

        // Crown fire fireline intensity (Btu/ft/s)
        this.firelineIntensity = this.heatPerUnitArea * (this.headingSpreadRate / 60)

        // Crown fire flame length using Thomas (1963)
        this.flameLength = (this.firelineIntensity > 0 ) ? 0.2 * this.firelineIntensity**(2/3) : 0

        // Rothermel's power-of-the-fire (ft-lb/ft2/s)
        this.powerOfFire = this.firelineIntensity / 129

        // Rothermel's power-of-the-wind (ft-lb/ft2/s)
        const diff = Math.max(0, (windSpeed20ft - this.headingSpreadRate) / 60) // 'diff' must be in ft/s
        this.powerOfWind = 0.00106 * diff * diff * diff

        this.powerRatio = (this.powerOfWind>0) ? (this.powerOfFire / this.powerOfWind) : 0
        this.isPlumeDominated = this.powerRatio >= 1
        this.isWindDriven = this.powerRatio < 1
    }
}
