/**
 * simple2.js refactors simple1.js by grouping input parameters into objects used
 * by each function, then combining them all into a single 'params' object:
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { fmt, fmtVector } from './utils.js'

const start = performance.now()

const fuelKey = 'gs4'

// FuelBed.update() params:
const fuelCuring = {
    curedHerb: 0.5,
}

// FuelIgnition.update() params:
const fuelMoisture = {
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5
}

// FireBehavior.update() params
export const windSlope = {
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,
    slopeDegrees: 14.03624347,
    aspect: 180,
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    airTemp: 95,            // only used by scorch height
}

// FireSize.update() params
export const firePosition = {
    elapsedTime: 60,
    ignEast:0,
    ignNorth:0,
    ignX:0,
    ignY:0
}

// FireVector*.update() params:
export const fireVector = {
    betaFromHead: 45,
    psiFromHead: 45,
    calcFlameLength: true,
}

// Combine all input parameters into a single object
const params = {...fuelCuring, ...fuelMoisture, ...windSlope, ...firePosition, ...fireVector}

// Calculate results:
const catalog = new FuelModelCatalog()
const fuelModel = catalog.get(fuelKey)
const fuelBed = new FuelBed({fuelModel, ...params})
const fuelIgnition = new FuelIgnition({fuelBed, ...params})
const fireBehavior = new FireBehavior({fuelIgnition, ...params})
const {headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio} = fireBehavior
const fireShape = new FireShape({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})

// Process fire distance and location at specific elapsed time and angle
const fireSize = new FireSize({fireShape, ...params})
const head = new FireVectorHead({fireSize})
const back = new FireVectorBack({fireSize})
const beta5 = new FireVectorBeta({fireSize, ...params})
const beta6 = new FireVectorBeta6({fireSize, ...params})
const psi = new FireVectorPsi({fireSize, ...params})

const stop = performance.now()

console.table([
    {name: 'head spread rate', value: fmt(fireBehavior.headingSpreadRate), units: 'ft/min'},
    {name: 'heading from north', value: fmt(fireBehavior.headingFromNorth), units: 'deg'},
    {name: 'head flame length', value: fmt(fireBehavior.flameLength), units: 'ft'},
    {name: 'length-to-width ratio', value: fmt(fireBehavior.lengthWidthRatio), units: 'dl'},
    {name: 'elapsed time', value: fmt(firePosition.elapsedTime), units: 'min'},
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

console.log(`simple2.js elapsed time: ${fmt(stop-start)} msec`)
