import { FuelBed } from './FuelBed.js'
import { FuelIgnition } from './FuelIgnition.js'
import { FireBehavior } from './FireBehavior.js'
import { CrownFireFuelModel } from "./FuelModels.js"

export class ActiveCrownFireFuelBed extends FuelBed {
    constructor() {
        super({fuelModel: CrownFireFuelModel, curedHerb: 0})
    }
}

// params must have {fuelBed, moistureDead1h, etc}
export class ActiveCrownFireFuelIgnition extends FuelIgnition {
    constructor(params=null) {
        super(params)
    }
}

export const ActiveCrownFireBehaviorProps = [
        {key: 'fireBehavior', type: 'FireBehavior', init: {}, desc: ''},
        {key: 'headingSpreadRate', type: 'fireRos', init: 0, desc: 'Active crown fire spread rate'},
        {key: 'canopyFuelLoad', type: '', init: 0, desc: 'Crown canopy ovendry fuel load'},
        {key: 'canopyFuelHpua', type: '', init: 0, desc: 'Crown canopy heat per unit area'},
        {key: 'heatPerUnitArea', type: 'fireHpua', init: 0, desc: 'Active crown fire sum of surface and crown fuel heats per unit area'},
        {key: 'firelineIntensity', type: 'fireFli', init: 0, desc: 'Active crown fire fireline intensity'},
        {key: 'flameLength', type: 'fireFl', init: 0, desc: 'Active crown fire flame length'},
        {key: 'powerOfFire', type: 'power', init: 0, units: 'ft-lb/ft2/s', desc: "Rothermel's power-of-the-fire"},
        {key: 'powerOfWind', type: 'power', init: 0, units: 'ft-lb/ft2/s', desc: "Rothermel's power-of-the-wind"},
        {key: 'powerRatio', type: 'ratio', init: 0, desc: ''},
        {key: 'isPlumeDominated', type: '', init: 0, desc: ''},
        {key: 'isWindDriven', type: '', init: 0, desc: ''},
]

// params must have {fuelIgnition, windSpeed20ft, canopyBulkDensity, canopyLength}
export class ActiveCrownFireBehavior {
    constructor(params=null) {
        this.#init()
        this.fireBehavior = new FireBehavior()
        if (params) this.update(params)
    }

    #init() {
        for(let {key, init} of ActiveCrownFireBehaviorProps)
            this[key] = init
    }

    // MUST have fuelIgnition, windSpeed20ft, canopyBulkDensity, canopyLength (canopyHeatConetnt is optional)
    checkParams(params) {
        for(let prop of ['fuelIgnition', 'windSpeed20ft', 'canopyBulkDensity', 'canopyLength']) {
            if (! Object.hasOwn(params, prop))
                throw new Error(`ActiveCrownFireBehavior.update(params) requires a 'params.${prop}' property`)
        }
    }

    update(params) {
        this.checkParams(params)
        // Alternatively, assign defaults of zero
        const {windSpeed20ft=0, canopyLength=0, canopyBulkDensity=0, canopyHeatContent=8000} = params

        // Pass crown-specific properties to FireBehavior.update()
        this.fireBehavior.update({...params, midflameWindSpeed: windSpeed20ft, slopeRatio: 0, limitWindSpeedFactor: false})
        
        // Rothermel's crown fire spread rate (ft/min)
        this.headingSpreadRate = 3.34 * this.fireBehavior.headingSpreadRate

        // Canopy fuel load, HPUA
        this.canopyFuelLoad = canopyBulkDensity * canopyLength
        this.canopyFuelHpua = this.canopyFuelLoad * canopyHeatContent

        // Active crown fire heat per unit area is the sum of the surface fire HPUA
        // and the entire active canopy HPUA (i.e., canopy load * canopy heat content),
        // and IS NOT the fuel model 10 HPUA.
        this.heatPerUnitArea = this.fireBehavior.heatPerUnitArea + this.canopyFuelHpua

        // Crown fire fireline intensity (Btu/ft/s)
        this.firelineIntensity = this.heatPerUnitArea * (this.headingSpreadRate / 60)

        // Crown fire flame length using Thomas (1963)
        this.flameLength = (this.fireLineIntensity > 0 ) ? 0.2 * this.firelineIntensity**(2/3) : 0

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
