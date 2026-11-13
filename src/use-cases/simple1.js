/**
 * simple1.js demonstrates the calling sequence of all the fire behavior classes
 * and their input parameters.  It diplays some common fire behavior properties,
 * size, and location at a given time after ignition for a single fuel model
 * under constant fuel moisture, wind, and slope conditions.
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { fmtVector, fmt } from './utils.js'

const start = performance.now()

// Create a catalog of the 13 Anderson and 40 SCott & Burgan fire behavior fuel models:
const catalog = new FuelModelCatalog()

// Get Scott and Burgan's fuel model "gs4" (number 124) for "high load, humid climate grass-shrub"
// which has all 3 dead fuel size classes, live stemwood, and curable herbs:
const fuelModel = catalog.get('gs4')

// Condition the fuel bed with 50 percent herb curing:
const fuelBed = new FuelBed({fuelModel, curedHerb: 0.5})

// Apply the effects of fuel moisture content to the fuel bed ignition process:
const fuelIgnition = new FuelIgnition({
    fuelBed,                // FuelModel reference
    moistureDead1h: 0.05,   // fuel moisture content (fraction)
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5})

// Apply the effects of wind and slope to the fuel bed's fire behavior:
const fireBehavior = new FireBehavior({
    fuelIgnition,               // FuelIgnition reference
    midflameWindSpeed: 10*88,   // 10 mph * 88 => ft/min
    windBearing: 90,            // wind heading to the east
    slopeRatio: 0.25,           // slope of 14.03624347 degrees
    aspect: 180,                // southerly aspect (upslope is north)
    limitWindSpeedFactor: true, // limit effective wind speed by fire intnensity (advanced use only; omit or leave as true)
    limitSpreadRateToWindSpeed: true})   // limit spread rate to wind speed (advanced use only; omit or leave as true)

// Determine fire's elliptical shape from the spread rate, heading direction,
// flame length, and length-to-width ratio estimated by the above statement:
const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
const fireShape = new FireShape({
    headingSpreadRate,
    headingFromNorth,
    flameLength,
    lengthWidthRatio
})

// Determine the fire spread distance, size, and location
const fireSize = new FireSize({fireShape,
    elapsedTime: 60,    // time since ignition (min)
    ignEast: 0,         // ignition point easting (x-coordinate)
    ignNorth: 0})       // ignition point northing (y-coordinate)

// Determine the fire spread rate, distance, and intensity from the *ignition point*
// at some angle from the fire head:
const head = new FireVectorHead({fireSize, calcFlameLength: true})
const back = new FireVectorBack({fireSize, calcFlameLength: true })
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45, calcFlameLength: true})
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45, calcFlameLength: true})

// Determine the fire spread rate, distance, and intensity from a "fire front"
// at some angle from the fire head:
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})

const stop = performance.now()

console.table([
    {name: 'head spread rate', value: fmt(fireBehavior.headingSpreadRate), units: 'ft/min'},
    {name: 'heading from north', value: fmt(fireBehavior.headingFromNorth), units: 'deg'},
    {name: 'head flame length', value: fmt(fireBehavior.flameLength), units: 'ft'},
    {name: 'length-to-width ratio', value: fmt(fireBehavior.lengthWidthRatio), units: 'dl'},
    {name: 'elapsed time', value: 60, units: 'min'},
    {name: 'fire ellipse length', value: fmt(fireSize.length), units: 'ft'},
    {name: 'fire ellipse width', value: fmt(fireSize.width), units: 'ft'},
    {name: 'fire ellipse size', value: fmt(fireSize.acres), units: 'ac'},
])

// Accumulate results in a table
console.table([
    fmtVector(head, 'head'),
    fmtVector(back, 'back'),
    fmtVector(beta5, 'beta5'),
    fmtVector(beta6, 'beta6'),
    fmtVector(psi, 'psi'),
])

console.log(`simple1.js elapsed time: ${fmt(stop-start)} msec`)
