/**
 * simple1.js demonstrates the calling sequence of all the wildland fire behavior
 * classes (modules) and their fuel, moisture, wind, and slope input parameters.
 * 
 * The sample output diplays some of the more common fire behavior spread rate,
 * intensity, size, and location properties estimated by each module.
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from "#lib"
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib'
import { fmt } from './utils.js'

// Utility functions for reporting outputs
const results = []
const vectors = []

// Start a timer
const start = performance.now()

// 1 - Create a catalog of the 13 Anderson and 40 Scott & Burgan fire behavior fuel models:
const catalog = new FuelModelCatalog()

// 2 - Get Scott and Burgan's fuel model "gs4" (number 124) for "high load, humid climate grass-shrub"
// which has all 3 dead fuel size classes, live stemwood, and curable herbs:
const fuelKey = "gs4"
const fuelModel = catalog.get(fuelKey)

log('Fuel Model Key', fuelKey, 'code')
log('Fuel Model Label', fuelModel.label, '')

// 3- Create a FuelBed structure using "gs4" fuels with 50 percent herb curing:
const fuelBed = new FuelBed({
    fuelModel,          // FuelModel reference from previous step
    curedHerb: 0.5})    // Cured herbaceous fuel fraction  

log('Fuel Bed Sa/Vol', fuelBed.savr, 'ft2/ft3')

// 4 - Create a FuelIgnition processor to apply the effects of fuel moisture
// content on the fuel bed ignition process:
const fuelIgnition = new FuelIgnition({
    fuelBed,                // FuelModel reference from previous step
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5}) // live stem wood fuel moisture content (fraction)

log('No-wind Spread Rate', fuelIgnition.noWindSpreadRate, 'ft/min')

// 5 - Create a FireBehavior processor to apply the effects of wind and slope
// on the fuel bed's fire behavior
const fireBehavior = new FireBehavior({
    fuelIgnition,               // FuelIgnition reference from previous step
    midflameWindSpeed: 10*88,   // midflame wind speed (ft.min) 10 mph * 88 => ft/min
    windBearing: 90,            // wind heading (compass degrees clockwise from north)
    slopeRatio: 0.25,           // slope rise/reach ratio (0.25 = 14.03624347 degrees)
    aspect: 180,                // slope aspect (down slope direction) (compass degrees clockwise from noth)
    limitWindSpeedFactor: true, // limit effective wind speed by fire intensity (advanced use only; omit or leave as true)
    limitSpreadRateToWindSpeed: true})   // limit spread rate to wind speed (advanced use only; omit or leave as true)

log('Heading Spread Rate', fireBehavior.headingSpreadRate, 'ft/min')
log('Heading Direction', fireBehavior.headingFromNorth, 'Deg from North')
log('Flame length', fireBehavior.flameLength, 'ft')
log('Length-to-Width Ratio', fireBehavior.lengthWidthRatio, 'ratio')

// 6- Create a FireShape from the FireBehavior to determine fire's elliptical shape.
// This example uses the FireBehavior results, but field observations could be used as well.
const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
const fireShape = new FireShape({
    headingSpreadRate,          // maximum fire spread rate (ft/min),
    headingFromNorth,           // fire direction of maximum spread (degrees clockwise from north)
    flameLength,                // flame length at fire head (ft)
    lengthWidthRatio            // fire ellipse length-to-width ratio
})

log('Backing Spread Rate', fireShape.backingSpreadRate, 'ft/min')

// 7 - Create a FireSize to determine the fire spread distance, size, and location
const fireSize = new FireSize({
    fireShape,          // FireShape reference from the above statement
    elapsedTime: 60,    // time since ignition (min)
    ignEast: 0,         // ignition point easting (x-coordinate)
    ignNorth: 0})       // ignition point northing (y-coordinate)

log('Fire Area', fireSize.area, 'ft2')
log('Fire Perimeter', fireSize.perimeter, 'ft')
log('Fire Length', fireSize.length, 'ft')
log('Fire Width', fireSize.width, 'ft')

// 8 - Determine the fire spread rate, distance, and intensity from the *ignition point*
// at some angle from the fire head:
const head = new FireVectorHead({fireSize, calcFlameLength: true})
logVector('Heading Vector', head)
const back = new FireVectorBack({fireSize, calcFlameLength: true })
logVector('Backing Vector', back)
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45, calcFlameLength: true})
logVector('Beta (v5) at 45-deg', beta5)
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45, calcFlameLength: true})
logVector('Beta (v6) at 45-deg', beta6)

// 9 - Determine the fire spread rate, distance, and intensity from a "fire front"
// at some angle from the fire head:
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})
logVector('Psi at 45-deg from wind', psi)

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
