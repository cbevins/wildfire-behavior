import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib/ActiveCrownFire.js'
import * as Bp from './Bp6Inputs.js'

// Need a surface fire
const catalog = new FuelModelCatalog()
const surfaceFuelModel = catalog.get('tu4')
const surfaceFuelBed = new FuelBed({fuelModel: surfaceFuelModel, curedHerb: Bp.fuelCuring.curedHerb})
const surfaceFuelIgnition = new FuelIgnition({fuelBed: surfaceFuelBed, ...Bp.fuelMoisture})
const surfaceFireBehavior = new FireBehavior({fuelIgnition: surfaceFuelIgnition, ...Bp.windSlope, ...Bp.options, slopeRatio: 0})

const params = {
    curedHerb: 0.778,
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,
    aspect: 180,
    airTemp: 95,            // only used by scorch height
}

// Determine the active creown fire
const canopyFuelBed = new CanopyFuelBed()
const canopyFuelIgnition = new CanopyFuelIgnition({fuelBed: canopyFuelBed, ...params})

params.fireBehavior = surfaceFireBehavior
params.canopyFuelIgnition = canopyFuelIgnition
params.windSpeed20ft = 10*88
params.canopyBulkDensity = 0.02
params.canopyLength = 40
params.canopyHeatContent = 8000
const activeCrownFireBehavior = new ActiveCrownFireBehavior(params)
activeCrownFireBehavior.update(params)
console.log(activeCrownFireBehavior)
