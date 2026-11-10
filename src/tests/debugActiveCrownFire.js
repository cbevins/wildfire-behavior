import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, calcCanopyFuelLoad, calcCanopyFuelHpua } from '#lib/index.js'
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
}

// Determine the active crown fire
const canopyFuelBed = new CanopyFuelBed()
const canopyFuelIgnition = new CanopyFuelIgnition({fuelBed: canopyFuelBed, ...params})
const activeCrownFireBehavior = new ActiveCrownFireBehavior()

const windSpeed20ft = 10*88

const canopyHeight = 40
const canopyBase = 6
const canopyBulkDensity = 0.02
const canopyLength = canopyHeight - canopyBase
const canopyFuelLoad = calcCanopyFuelLoad({canopyLength, canopyBulkDensity})

const canopyFuelHeat = 8000
const canopyFuelHpua = calcCanopyFuelHpua({canopyFuelLoad, canopyFuelHeat})

const surfaceFuelHpua = surfaceFireBehavior.heatPerUnitArea

activeCrownFireBehavior.update({canopyFuelIgnition, windSpeed20ft, canopyFuelHpua, surfaceFuelHpua})
console.log(activeCrownFireBehavior)
