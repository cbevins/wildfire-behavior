import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, calcCanopyFuelLoad, calcCanopyFuelHpua } from '#lib/index.js'
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib/ActiveCrownFireBehavior.js'

const params = {
    curedHerb: 0.5,
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    midflameWindSpeed: 40*88,
    windBearing: 90,
    slopeRatio: 0,
    aspect: 180,
    canopyHeight: 50,
    canopyBase: 10,
    canopyCover: 0.25,
    canopyBulkDensity: 0.02,
}

// Need a surface fire
const catalog = new FuelModelCatalog()
const surfaceFuelModel = catalog.get('gs4')
const surfaceFuelBed = new FuelBed({fuelModel: surfaceFuelModel, curedHerb: 0.5})
const surfaceFuelIgnition = new FuelIgnition({fuelBed: surfaceFuelBed, ...params})
const surfaceFireBehavior = new FireBehavior({fuelIgnition: surfaceFuelIgnition, ...params})

// Determine the active crown fire
const canopyFuelBed = new CanopyFuelBed()
const canopyFuelIgnition = new CanopyFuelIgnition({fuelBed: canopyFuelBed, ...params})
const activeCrownFireBehavior = new ActiveCrownFireBehavior()

const canopyLength = params.canopyHeight - params.canopyBase
const canopyFuelLoad = calcCanopyFuelLoad({canopyLength, canopyBulkDensity: params.canopyBulkDensity})
const canopyFuelHpua = calcCanopyFuelHpua({canopyFuelLoad, canopyFuelHeat: 8000})

const surfaceFuelHpua = surfaceFireBehavior.heatPerUnitArea
const windSpeed20ft = params.midflameWindSpeed
activeCrownFireBehavior.update({
    canopyFuelIgnition, windSpeed20ft, canopyFuelHpua, surfaceFuelHpua})

console.log(activeCrownFireBehavior)
