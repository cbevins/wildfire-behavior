import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape } from '../index.js'

// Inputs
const fuelKey = '10'
const fuelCuring = {
    curedHerb: 0.778,
}
const fuelMoisture = {
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5
}
const midflameWindSpeed = 10*88
const windBearing = 90
const aspect = 180
const slopeRatio = 0.25
const limitWindSpeedFactor = true
const limitSpreadRateToWindSpeed = true

// Processing
const catalog = new FuelModelCatalog()
const fuelModel = catalog.get(fuelKey)
const fuelBed = new FuelBed(fuelModel, fuelCuring)
const fuelIgnition = new FuelIgnition(fuelBed, fuelMoisture)
const fireBehavior = new FireBehavior(fuelBed, fuelIgnition,
    midflameWindSpeed, windBearing, slopeRatio, aspect,
    limitWindSpeedFactor, limitSpreadRateToWindSpeed)
const fireShape = new FireShape(fireBehavior)
console.table(fireShape)
