import { ActiveCrownFireFuelBed, ActiveCrownFireFuelIgnition, ActiveCrownFireBehavior } from '#lib/index.js'


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

const crownBed = new ActiveCrownFireFuelBed()
const crownIgnition = new ActiveCrownFireFuelIgnition({fuelBed: crownBed, ...params})
params.windSpeed20ft = 10*88
params.canopyBulkDensity = 0.02
params.canopyLength = 40
params.canopyHeatContent = 8000

const crownBehavior = new ActiveCrownFireBehavior({fuelIgnition: crownIgnition, ...params})
crownBehavior.update({fuelIgnition: crownIgnition, ...params})
