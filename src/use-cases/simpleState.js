/**
 * simpleState.js refactors simple2.js as a state machine.
 * 
 * All inputs are specified in a single params object (use the 'simpleStateParams' as a template).
 * 
 * This is not optimized in any manner in that all modules are updated with each update() call.
 * But is still suitable for producing in cases where the input params are (semi-) random or
 * unknown in advance.  One such use-case is producing FlamMap style maps from LANDFIRE
 * fuel model, slope, aspect arrays and local wind and fuel moisture inputs.
 */
import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { fmt, fmtVector } from './utils.js'

export const simpleStateParams = {
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
    slopeRatio: 0.25,                   // slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 95,                        // only used by vector scorch height
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
}

export class SimpleState {
    constructor(params=null) {
        this.#initClasses()
        if (params) this.update(params)
    }
    #initClasses() {
        this.params = {}
        this.fuelCatalog = new FuelModelCatalog()
        this.fuelModel = null
        this.fuelBed = new FuelBed()
        this.fuelIgnition = new FuelIgnition()
        this.fireBehavior = new FireBehavior()
        this.fireShape = new FireShape()
        this.fireSize = new FireSize()
        this.headVector = new FireVectorHead()
        this.backVector = new FireVectorBack()
        this.beta5Vector = new FireVectorBeta()
        this.beta6Vector = new FireVectorBeta6()
        this.psiVector = new FireVectorPsi()
    }

    update(params) {
        // Store a *copy* of the params
        this.params = {...params}

        // Get the requested fuel model by number or alpha code:
        this.fuelModel = this.fuelCatalog.get(params.fuelKey)

        // Condition the fuel bed with current cured fuel fractions:
        this.fuelBed.update({fuelModel: this.fuelModel, ...params})

        // Apply effects of fuel moisture on fuel bed ignition process:
        this.fuelIgnition.update({fuelBed: this.fuelBed, ...params})

        // Apply the effects of wind and slope to the fuel bed's fire behavior:
        this.fireBehavior.update({fuelIgnition: this.fuelIgnition, ...params})

        // Determine fire's elliptical shape from fire spread rate, bearing, andl/w ratio
        this.fireShape.update({fireBehavior: this.fireBehavior, ...params})
        
        // Determine the fire spread distance, size, and location
        this.fireSize.update({fireShape: this.fireShape, ...params})

        // Determine the fire spread rate, distance, and intensity from the *ignition point*
        // at some angle from the fire head:
        this.headVector.update({fireSize: this.fireSize})
        this.backVector.update({fireSize: this.fireSize})
        this.beta5Vector.update({fireSize: this.fireSize, ...params})
        this.beta6Vector.update({fireSize: this.fireSize, ...params})

        // Determine the fire spread rate, distance, and intensity from a "fire front"
        // at some angle from the fire head:
        this.psiVector.update({fireSize: this.fireSize, ...params})
    }

    display() {
        console.table([
            {name: 'head spread rate', value: fmt(this.fireBehavior.headingSpreadRate), units: 'ft/min'},
            {name: 'heading from north', value: fmt(this.fireBehavior.headingFromNorth), units: 'deg'},
            {name: 'head flame length', value: fmt(this.fireBehavior.flameLength), units: 'ft'},
            {name: 'length-to-width ratio', value: fmt(this.fireBehavior.lengthWidthRatio), units: 'dl'},
            {name: 'elapsed time', value: fmt(this.params.elapsedTime), units: 'min'},
            {name: 'fire ellipse length', value: fmt(this.fireSize.length), units: 'ft'},
            {name: 'fire ellipse width', value: fmt(this.fireSize.width), units: 'ft'},
            {name: 'fire ellipse size', value: fmt(this.fireSize.acres), units: 'ac'},
        ])
        
        // Accumulate results in a table
        console.table([
            fmtVector(this.headVector, 'head'),
            fmtVector(this.backVector, 'back'),
            fmtVector(this.beta5Vector, 'beta5'),
            fmtVector(this.beta6Vector, 'beta6'),
            fmtVector(this.psiVector, 'psi'),
        ])
    }
}

// ------------------------------------------------------

const start = performance.now()
const state = new SimpleState(simpleStateParams)
const stop = performance.now()

state.display()
console.log(`simpleState.js elapsed time: ${fmt(stop-start)} msec`)
