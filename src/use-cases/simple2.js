/**
 * simple2.js refactors simple1.js by grouping input parameters into objects used
 * by each function, then combining them all into a single 'params' object:
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize, calcMidflameWsrf } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib'
import { calcCanopyMidflameWsrf, calcCanopyFuelLoad, calcCanopyFuelHpua } from "#lib"
import { SpottingSurfaceFire, SpottingBurningPile, spottingTopography } from "#lib"
import { fmt, fmtVector } from './utils.js'

// Result tables
const results = []
const vectors = []

// Start a timer
const start = performance.now()

// FuelBed params:
const fuelCuring = {
    fuelKey: 'gs4',
    curedHerb: 0.5,
}

// FuelIgnition params:
const fuelMoisture = {
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5
}

// Canopy and midflame wind speed inputs
const canopy = {
    canopyBase: 10,         // canopy base height (ft)
    canopyHeight: 50,       // canopy height (ft)
    canopyCover: 0.25,      // canopy cover (fraction)
    canopyBulkDensity: 0.02,// canopy bulk density (lb/ft3)
    canopyHeat: 8000,       // canopy fuel heat of combustion (Btu/lb)
}

// FireBehavior input params
const windSlope = {
    windSpeed20ft: 40*88,       // 40 mph in ft/min
    wsrf: 1,                    // wind speed reduction factor
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,
    // slopeDegrees: 14.03624347,
    aspect: 180,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    airTemp: 95,            // only used by scorch height
}

// FireSize params
const firePosition = {
    elapsedTime: 60,    // time since ignition (min)
    ignEast:0,
    ignNorth:0,
    ignX:0,             // no need to change
    ignY:0              // no need to change
}

// FireVector* params:
export const fireVector = {
    betaFromHead: 45,
    psiFromHead: 45,
    calcFlameLength: true,
}

export const spotting = {
    downwindCoverHt: canopy.canopyHeight,   // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,  // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    location: 'ridgeTop',       // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
    ridgeToValleyDist: 2*5280,  // Horizontal distance from ridge top to valley bottom (ft)
    ridgeToValleyElev: 3000,    // Vertical distance from ridge top to valley bottom (ft)
    flameHt: 10,                // flame height from a *burning pile* (ft)
}

// Combine all module input parameters into a single parameters object
const params = {...fuelCuring, ...fuelMoisture, ...canopy, ...windSlope,
    ...firePosition, ...fireVector, ...spotting}


//------------------------------------------------------------------------------
// 1 - Define available fuel models.

// 1.1 - Create a catalog of the 13 Anderson and 40 Scott & Burgan surface fire behavior fuel models:
const catalog = new FuelModelCatalog()

// 1.2 - Create a canopy fuel model if crown fire behavior is needed:
// (Same as step 3 for surface fuels, but no catalog fuel model or curing is needed.)
const canopyFuelBed = new CanopyFuelBed()

// 1.3 - Add any custom fuel models to the fuel catalog:

//------------------------------------------------------------------------------
// 2 - Select a surface fuel model.
// Here we use Scott and Burgan's fuel model "gs4" (number 124) for "high load, humid climate grass-shrub"
// which has all 3 dead fuel size classes, live stemwood, and curable herbs:
const fuelModel = catalog.get(params.fuelKey)
log('Fuel Model Key', params.fuelKey, 'string')
log('Fuel Model Label', fuelModel.label, 'string')

//------------------------------------------------------------------------------
// 3 - Apply fuel model and curing conditions to create a fire simulation fuel bed.
// Seventeen of the standard fire behavior fuel models have curable herbaceous fuels.
// Here we use the "gs4" fuel mode from above with 50 percent herb curing:
const fuelBed = new FuelBed({fuelModel, ...params})
log('Fuel Bed Surf Area/Vol', fuelBed.savr, 'ft2/ft3')

//------------------------------------------------------------------------------
// 4 - Apply fuel moisture conditions to the surface and/or crown fuels
// to determine fuel ignition and fire properties under no slope or wind:

// 4.1 - Create a FuelIgnition processor for the surface fire:
const fuelIgnition = new FuelIgnition({fuelBed, ...params})
log('No-wind Spread Rate', fuelIgnition.noWindSpreadRate, 'ft/min')

// 4.2 - Create a CanopyFuelIgnition processor for the crown fire (if needed)
// to apply the effects of the *same* fuel moisture contents on the crown fuels:
const canopyFuelIgnition = new CanopyFuelIgnition({fuelBed: canopyFuelBed, ...params})

//------------------------------------------------------------------------------
// 5 - Determine the surface fuel *midflame* wind speed.
// In the absence of field observations, midflame wind speed can be estimated
// from the 20-ft wind speed and the fuel bed depth and canopy properties:
params.wsrf = calcMidflameWsrf({fuelBed, ...params})

// Optionally, we could calculate just the *canopy* reduction factor:
const canopyWsrf = calcCanopyMidflameWsrf(params)
// And we could retrieve just the *fuel bed* reduction factor
const fuelBedWsrf = fuelBed.midflameWsrf

// Apply the estimated midflame wind speed reduction factor to the 20-ft wind speed
params.midflameWindSpeed = params.wsrf * params.windSpeed20ft

log('Canopy Reduction Factor', canopyWsrf, 'ratio')
log('Fuel Bed Reduction Factor', fuelBedWsrf, 'ratio')
log('Wind Speed Reduction Factor', params.wsrf, 'ratio')
log('Wind Speed at 20-ft', params.windSpeed20ft, 'ft/min')
log('Wind Speed at Midflame', params.midflameWindSpeed, 'ft/min')

//------------------------------------------------------------------------------
// 6 - Apply wind and slope effects to the surface and crown ignition properties
// to determine maximum spread rate, intensity, and direction of maximum spread:

// 6.1 - Create a FireBehavior processor for the surface fire:
const fireBehavior = new FireBehavior({fuelIgnition, ...params})

log('Heading Spread Rate', fireBehavior.headingSpreadRate, 'ft/min')
log('Heading Direction', fireBehavior.headingFromNorth, 'Deg from North')
log('Flame length', fireBehavior.flameLength, 'ft')
log('Length-to-Width Ratio', fireBehavior.lengthWidthRatio, 'ratio')

// 6.2 - Create a FireBehavior processor for the crown fire (if needed):
// 6.2.1 - Determine canopy fuel load from canopyBulkDensity and canopyLength
const canopyLength = params.canopyHeight - params.canopyBase
const canopyFuelLoad = calcCanopyFuelLoad({canopyLength, ...params})

// 6.2.2 - Determine canopy fuel heat per unit area from canopyFuelLoad and canopyFuelHpua
const canopyFuelHpua = calcCanopyFuelHpua({canopyFuelLoad, ...params})

// 6.2.3 - Create an ActiveCrownFireBehavior processor to determine crown fire
// spread rate, flame length, and type (plume-dominated or wind-driven)
// (Note: wind speed is *at 20-ft* and no slope steepness or aspect are required)
const crownFire = new ActiveCrownFireBehavior({
    canopyFuelIgnition, // CanopyFuelIgnition reference from step 4.2
    windSpeed20ft: params.windSpeed20ft,            // wind speed at 20-ft (ft/min)
    canopyFuelHpua,                                 // canopy fuel heat per unit area (Btu/ft2)
    surfaceFuelHpua: fireBehavior.heatPerUnitArea,  // Btu/ft2
})

log('Crown Fire Spread Rate', crownFire.headingSpreadRate, 'ft/min')
log('Crown Fire Flame Length', crownFire.flameLength, 'ft')
log('Crown Fire Power Fire/Wind', crownFire.powerRatio, 'ratio')

//------------------------------------------------------------------------------
// 7 - Determine surface fire's elliptical shape and expansion rates.
// Here we use the FireBehavior results from step 6.1,
// but actual field observation values could be used as well:
const {headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio} = fireBehavior
const fireShape = new FireShape({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})

log('Backing Spread Rate', fireShape.backingSpreadRate, 'ft/min')

//------------------------------------------------------------------------------
// 8 - Determine surface fire ellipse size and perimeter at some time after ignition:
const fireSize = new FireSize({fireShape, ...params})

log('Fire Area', fireSize.area, 'ft2')
log('Fire Perimeter', fireSize.perimeter, 'ft')
log('Fire Length', fireSize.length, 'ft')
log('Fire Width', fireSize.width, 'ft')

//------------------------------------------------------------------------------
// 9 - Determine the fire ellipse spread rate, distance, intensity and position
// along various fire vectors:

// 9.1 - Fire vectors at the ellipse head and back:
const head = new FireVectorHead({fireSize, ...params})
const back = new FireVectorBack({fireSize, ...params})

logVector('Heading Vector', head)
logVector('Backing Vector', back)

// 9.2 - Fire vectors from the *ignition point* at some angle clockwise (beta)
// from the fire ellipse head:
const beta5 = new FireVectorBeta({fireSize, ...params})
const beta6 = new FireVectorBeta6({fireSize, ...params})

logVector('Beta (v5) at 45-deg', beta5)
logVector('Beta (v6) at 45-deg', beta6)

// 9.3 - Fire vector from a *fire front* at some angle clockwise (psi)
// from the wind bearing (or the fire ellipse heading):
const psi = new FireVectorPsi({fireSize, ...params})

logVector('Psi at 45-deg from wind', psi)

//------------------------------------------------------------------------------
// 10 - Determine surface fire spotting distance

// 10.1 - First determine spotting distance over flat terrain:
// const spotSurfaceFlat = new SpottingSurfaceFire(params)
const spotSurfaceFlat = new SpottingSurfaceFire({
    downwindCoverHt: params.canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft: params.windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameLength: fireBehavior.flameLength // Surface fire flame length (ft)
})

const spotSurfaceTopo = spottingTopography({flatDistance: spotSurfaceFlat.levelDistance, ...params})

log('Surface firebrand height', spotSurfaceFlat.firebrandHt, 'ft')
log('Surface spotting distance', spotSurfaceFlat.levelDistance, 'ft')
log('Surface spotting over topography', spotSurfaceTopo, 'ft')

// 10.3 - Independently, we could also determine spotting distance from an burning pile
const spotPileFlat = new SpottingBurningPile(params)
const spotPileTopo = spottingTopography({flatDistance: spotPileFlat.levelDistance, ...params})

log('Burning pile firebrand height', spotPileFlat.firebrandHt, 'ft')
log('Burning pile level spotting distance', spotPileFlat.levelDistance, 'ft')
log('Burning pile spotting over topography', spotPileTopo, 'ft')

const stop = performance.now()
console.log('\nFire Behavior Results')
console.table(results)
console.log('\nFire Behavior and Position Along Vectors')
console.table(vectors)
console.log(`simple2.js elapsed time: ${fmt(stop-start)} msec`)

// Utility output functions
function log(property, value, units) {
    results.push({property, value: value, units})
}
function logVector(label, vector) {
    let {spreadRate, bearing, angleFromHead, distance, flameLength, east, north} = vector
    vectors.push({label, angleFromHead: fmt(angleFromHead), bearing: fmt(bearing), spreadRate: fmt(spreadRate),
        distance: fmt(distance), flameLength: flameLength, east: fmt(east), north: fmt(north)})
}
