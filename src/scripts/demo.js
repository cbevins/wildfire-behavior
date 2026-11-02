import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead,
    FireVectorPsi } from '#lib/index.js'

// Inputs
const fuelKey = '10'
// const fuelCuring = {
//     curedHerb: 0.778,
// }
const fuelMoisture = {
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5
}

// Used by new FireSize()
export const firePosition = {
    elapsedTime: 60,
    ignEast:0,
    ignNorth:0,
    ignX:0,
    ignY:0
}

// Used by new FireBehavior() and FireBehavior.update()
export const options = {
    limitWindSpeedFactor: true,         // used by FireBehavior
    limitSpreadRateToWindSpeed: true,   // used by FireBehavior
    calcFlameLength: true,              // used by FireVectors
}

// Used by new FireBehavior() and FireBehavior.update()
export const windSlope = {
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,
    slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 95,            // only used by scorch height
}

// Process fire spread rate, intensity, and elliptical shape
const catalog = new FuelModelCatalog()
const fuelModel = catalog.get(fuelKey)
const fuelBed = new FuelBed({fuelModel, curedHerb: 0.778})
const fuelIgnition = new FuelIgnition({fuelBed, ...fuelMoisture})
const fireBehavior = new FireBehavior({fuelIgnition, ...windSlope, ...options})
const fireShape = new FireShape(fireBehavior)   // NOTE: fireBehavior IS an object

// Process fire distance and location at specific elapsed time and angle
const fireSize = new FireSize({fireShape, ...firePosition})
const head = new FireVectorHead({fireSize})
const back = new FireVectorBack({fireSize})
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45})
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45})
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})

// Accumulate results in a table
console.table([
    setVector(head, 'head'),
    setVector(back, 'back'),
    setVector(beta5, 'beta5'),
    setVector(beta6, 'beta6'),
    setVector(psi, 'psi'),
])

function setVector(vector, name) {
    let {spreadRate, bearing, angleFromHead, distance, flameLength, east, north} = vector
    return {name, angleFromHead: fmt(angleFromHead), bearing: fmt(bearing), spreadRate: fmt(spreadRate),
        distance: fmt(distance), flameLength: fmt(flameLength), east: fmt(east), north: fmt(north)}
}

function fmt(v) { return Math.trunc(100*v)/100 }