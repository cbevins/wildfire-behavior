/**
 * simple1.js demonstrates the calling sequence of all the wildland fire behavior
 * classes (modules) and their fuel, moisture, wind, and slope input parameters.
 * 
 * The sample output diplays some of the more common fire behavior spread rate,
 * intensity, size, and location properties estimated by each module.
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from "#lib"
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib'
import { calcCanopyMidflameWsrf, calcCanopyFuelLoad, calcCanopyFuelHpua } from "#lib"
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib'
import { SpottingSurfaceFire, SpottingBurningPile } from "#lib"

import { fmt } from './utils.js'

// Utility functions for reporting outputs
const results = []
const vectors = []

// Start a timer
const start = performance.now()

//------------------------------------------------------------------------------
// 1 - Create fuel models
// 1.1 - Create a catalog of the 13 Anderson and 40 Scott & Burgan surface fire behavior fuel models:
const catalog = new FuelModelCatalog()

// 1.2 - Create a canopy fuel model if crown fire behavior is needed
const canopyFuelBed = new CanopyFuelBed()

//------------------------------------------------------------------------------
// 2 - Select a surface fuel model. Here we use Scott and Burgan's fuel model
// "gs4" (number 124) for "high load, humid climate grass-shrub"
// which has all 3 dead fuel size classes, live stemwood, and curable herbs:
const fuelKey = "gs4"
const fuelModel = catalog.get(fuelKey)

log('Fuel Model Key', fuelKey, 'string')
log('Fuel Model Label', fuelModel.label, 'string')

//------------------------------------------------------------------------------
// 3 - Create a FuelBed structure using "gs4" fuels with 50 percent herb curing:
const fuelBed = new FuelBed({
    fuelModel,          // FuelModel reference from previous step
    curedHerb: 0.5,    // Cured herbaceous fuel fraction  
})

log('Fuel Bed Surf Area/Vol', fuelBed.savr, 'ft2/ft3')

//------------------------------------------------------------------------------
// 4.1 - Create a FuelIgnition processor for the surface fire
// to apply the effects of fuel moisture content on the fuel bed ignition process:
const fuelIgnition = new FuelIgnition({
    fuelBed,                // FuelModel reference from previous step
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5, // live stem wood fuel moisture content (fraction)
})

log('No-wind Spread Rate', fuelIgnition.noWindSpreadRate, 'ft/min')

//------------------------------------------------------------------------------
// 4.2 - Create a CanopyFuelIgnition processor for the crown fire (if needed)
// to apply the effects of the *same* fuel moisture content on the crown fuels:
const canopyFuelIgnition = new CanopyFuelIgnition({
    fuelBed: canopyFuelBed, // CanopyFuelBed reference from step 1b
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5, // live stem wood fuel moisture content (fraction)
})

//------------------------------------------------------------------------------
// 5 - The FireBehavior module requires the wind speed *at midflame height*.
// In the absence of field observations, midflame wind speed can be estimated
// from the 20-ft wind speed using a reduction factor. If there is no canopy
// above the fuel bed, the reduction factor is a property of the fuel beb depth:
const windSpeed20ft = 40*88 // 20 mph in ft/min
const fuelBedWsrf = fuelBed.midflameWsrf
// If there is a canopy above the fuel, it can be estimated from canopy properties:
const canopyBase = 10       // canopy base height (ft)
const canopyHeight = 50     // canopy height (ft)
const canopyCover = 0.25    // canopy cover (fraction)
const canopyWsrf = calcCanopyMidflameWsrf({canopyBase, canopyHeight, canopyCover})
// Per BehavePlus, apply the smaller of the two factors (i.e., the greatest reduction)
const wsrf = Math.min(canopyWsrf, fuelBedWsrf)
const midflameWindSpeed = windSpeed20ft * wsrf

log('Wind Speed at 20-ft', windSpeed20ft, 'ft/min')
log('Canopy Reduction Factor', canopyWsrf, 'ratio')
log('Fuel Bed Reduction Factor', fuelBedWsrf, 'ratio')
log('Wind Speed at Midflame', midflameWindSpeed, 'ft/min')

//------------------------------------------------------------------------------
// 6.1 - Create a FireBehavior processor to apply the effects of wind and slope
// on the fuel bed's fire behavior
const fireBehavior = new FireBehavior({
    fuelIgnition,               // FuelIgnition reference from previous step
    midflameWindSpeed,          // midflame wind speed (ft/min)
    windBearing: 90,            // wind heading (compass degrees clockwise from north)
    slopeRatio: 0.25,           // slope rise/reach ratio (0.25 = 14.03624347 degrees)
    aspect: 180,                // slope aspect (down slope direction) (compass degrees clockwise from noth)
    limitWindSpeedFactor: true, // limit effective wind speed by fire intensity (advanced use only; omit or leave as true)
    limitSpreadRateToWindSpeed: true,   // limit spread rate to wind speed (advanced use only; omit or leave as true)
})

log('Heading Spread Rate', fireBehavior.headingSpreadRate, 'ft/min')
log('Heading Direction', fireBehavior.headingFromNorth, 'Deg from North')
log('Flame length', fireBehavior.flameLength, 'ft')
log('Length-to-Width Ratio', fireBehavior.lengthWidthRatio, 'ratio')

// 6.2 - If crown fire behavior is needed...
// 6.2.1 - Determine canopy fuel load from canopyBulkDensity and canopyLength
const canopyLength = canopyHeight - canopyBase
const canopyBulkDensity = 0.02  // lb/ft3
const canopyFuelLoad = calcCanopyFuelLoad({canopyLength, canopyBulkDensity})

// 6.2.2 - Determine canopy fuel heat per unit area from canopyFuelLoad and canopyFuelHpua
const canopyFuelHeat = 8000     // Btu/lb
const canopyFuelHpua = calcCanopyFuelHpua({canopyFuelLoad, canopyFuelHeat})

// 6.2.3 - Create an ActiveCrownFireBehavior processor to determine crown fire
// spread rate, flame length, and type (plume-dominated or wind-driven)
// (Note: wind speed is *at 20-ft* and no slope steepness or aspect are required)
const crownFire = new ActiveCrownFireBehavior({
    canopyFuelIgnition, // CanopyFuelIgnition reference from step 4b
    windSpeed20ft,      // wind speed at 20-ft (ft/min)
    canopyFuelHpua,     // canopy fuel heat per unit area (Btu/ft2)
    surfaceFuelHpua: fireBehavior.heatPerUnitArea,  // Btu/ft2
})

log('Crown Fire Spread Rate', crownFire.headingSpreadRate, 'ft/min')
log('Crown Fire Flame Length', crownFire.flameLength, 'ft')
log('Crown Fire Power Fire/Wind', crownFire.powerRatio, 'ratio')

// 7 - Create a FireShape from the FireBehavior to determine fire's elliptical shape.
// This example uses the FireBehavior results, but field observations could be used as well.
const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
const fireShape = new FireShape({
    headingSpreadRate,          // maximum fire spread rate (ft/min),
    headingFromNorth,           // fire direction of maximum spread (degrees clockwise from north)
    flameLength,                // flame length at fire head (ft)
    lengthWidthRatio,           // fire ellipse length-to-width ratio
})

log('Backing Spread Rate', fireShape.backingSpreadRate, 'ft/min')

// 8 - Create a FireSize to determine the fire spread distance, size, and location
const fireSize = new FireSize({
    fireShape,          // FireShape reference from the above statement
    elapsedTime: 60,    // time since ignition (min)
    ignEast: 0,         // ignition point easting (x-coordinate)
    ignNorth: 0,       // ignition point northing (y-coordinate)
})

log('Fire Area', fireSize.area, 'ft2')
log('Fire Perimeter', fireSize.perimeter, 'ft')
log('Fire Length', fireSize.length, 'ft')
log('Fire Width', fireSize.width, 'ft')

// 9 - Determine the fire spread rate, distance, intensity and position
// at the fire ellipse head and back fire vectors:
const head = new FireVectorHead({fireSize, calcFlameLength: true})
logVector('Heading Vector', head)
const back = new FireVectorBack({fireSize, calcFlameLength: true})
logVector('Backing Vector', back)

// 10 - Determine the fire spread rate, distance, intensity and position for a vector
// from the *ignition point* at some angle clockwise (beta) from the fire head:
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45, calcFlameLength: true})
logVector('Beta (v5) at 45-deg', beta5)
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45, calcFlameLength: true})
logVector('Beta (v6) at 45-deg', beta6)

// 11 - Determine the fire spread rate, distance, intensity and position for a vector
// from a *fire front* at some angle clockwise (psi) from the wind bearing (fire heading):
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})
logVector('Psi at 45-deg from wind', psi)

// 12 - SUrface fire spotting distance
const spotSurface = new SpottingSurfaceFire({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameLength: fireBehavior.flameLength // Surface fire flame length (ft)
})

log('Surface firebrand height', spotSurface.firebrandHt, 'ft')
log('Surface spotting distance', spotSurface.levelDistance, 'ft')

// 13 - Spotting distance from an burning pile
const spotPile = new SpottingBurningPile({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameHt: 10,                    // Burning pile flame height (ft)
})


log('Burning pile firebrand height', spotPile.firebrandHt, 'ft')
log('Burning pile spotting distance', spotPile.levelDistance, 'ft')

const stop = performance.now()
console.log('\nFire Behavior Results')
console.table(results)
console.log('\nFire Behavior and Position Along Vectors')
console.table(vectors)
console.log(`\nsimple1.js elapsed time: ${fmt(stop-start)} msec`)

// Utility output functions
function log(property, value, units) {
    results.push({property, value: value, units})
}
function logVector(label, vector) {
    let {spreadRate, bearing, angleFromHead, distance, flameLength, east, north} = vector
    vectors.push({label, angleFromHead: fmt(angleFromHead), bearing: fmt(bearing), spreadRate: fmt(spreadRate),
        distance: fmt(distance), flameLength: fmt(flameLength), east: fmt(east), north: fmt(north)})
}
