/**
 * simpleState.js refactors simple.js as a state machine.
 * All inputs are specified in a single params object 'simpleState'.
 * 
 * You can use this file to import and modify ther stateParams,
 * then call simpleState() and displayState().
 */

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead,
    FireVectorPsi } from '#lib/index.js'

export const stateParams = {
    // The following may be modified:
    // Creating a FuelModel
    fuelKey: '10',
    // Updating the FuelBed
    curedHerb: 0.778,
    // Updating the FuelIgnition
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    // Updating the FireBehavior
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,
    slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 95,                        // only used by scorch height
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    // Updating the FireSize
    elapsedTime: 60,
    ignEast:0,
    ignNorth:0,
    ignX:0,
    ignY:0,
    // Updating the FireVectors
    betaFromHead: 45,
    psiFromHead: 45,
    calcVectorFlameLength: true,

    // EXPERIMENTAL
    configFireBehavior: 'estimated',   // 'estimated' or 'input'

    // DO NOT MODIFY THESE!
    fuelCatalog: new FuelModelCatalog(),
    fuelModel: null,
    fuelBed: new FuelBed(),
    fuelIgnition: new FuelIgnition(),
    fireBehavior: new FireBehavior(),
    fireShape: new FireShape(),
    fireSize: new FireSize(),
    headVector: new FireVectorHead(),
    backVector: new FireVectorBack(),
    beta5Vector: new FireVectorBeta(),
    beta6Vector: new FireVectorBeta6(),
    psiVector: new FireVectorPsi(),
}

export function updateState(state) {
    // Process fire spread rate, intensity, and elliptical shape
    if (state.configFireBehavior !== 'input') {
        state.fuelModel = state.fuelCatalog.get(state.fuelKey)
        state.fuelBed.update(state)
        state.fuelIgnition.update(state)
        state.fireBehavior.update(state)
        // Promote FireBehavior results that are also observed fire behavior inputs
        state.headingSpreadRate = state.fireBehavior.headingSpreadRate
        state.flameLength = state.fireBehavior.flameLength
        state.headingFromNorth = state.fireBehavior.headingFromNorth
        state.lengthWidthRatio = state.fireBehavior.lengthWidthRatio
    } else {
        // state params must specify headingSpreadRate, headingFromNorth, flameLength, and lengthWidthRatio
        state.fireBehavior.update(state)
    }
    // Process fire distance and location at specific elapsed time and angle
    state.fireShape.update(state)
    state.fireSize.update(state)
    state.headVector.update(state)
    state.backVector.update(state)
    state.beta5Vector.update(state)
    state.beta6Vector.update(state)
    state.psiVector.update(state)
}

export function displayState(state) {
    function setVector(vectorRef, vector) {
        let {spreadRate, bearing, angleFromHead, distance, flameLength, east, north} = vectorRef
        return {vector, angleFromHead: fmt(angleFromHead),
            bearing: fmt(bearing), spreadRate: fmt(spreadRate),
            distance: fmt(distance), flameLength: fmt(flameLength), east: fmt(east), north: fmt(north)}
    }

    console.table([
        {name: 'head spread rate (ft/min)', value: fmt(state.headingSpreadRate)},
        {name: 'heading from north (deg)', value: fmt(state.headingFromNorth)},
        {name: 'head flame length (ft)', value: fmt(state.flameLength)},
        {name: 'length-to-width ratio', value: fmt(state.lengthWidthRatio)},
        {name: 'elapsed time (min)', value: fmt(state.elapsedTime)},
        {name: 'fire ellipse length (ft)', value: fmt(state.fireSize.length)},
        {name: 'fire ellipse width (ft)', value: fmt(state.fireSize.width)},
        {name: 'fire ellipse size (ac)', value: fmt(state.fireSize.acres)},
    ])

    // Accumulate results in a table
    console.table([
        setVector(state.headVector, 'head'),
        setVector(state.backVector, 'back'),
        setVector(state.beta5Vector, 'beta5'),
        setVector(state.beta6Vector, 'beta6'),
        setVector(state.psiVector, 'psi'),
    ])
}

function fmt(v) { return Math.trunc(100*v)/100 }

// ------------------------------------------------------

const start = performance.now()
updateState(stateParams)
const stop = performance.now()
displayState(stateParams)
console.log(`simpleState.js elapsed time: ${fmt(stop-start)} msec`)
