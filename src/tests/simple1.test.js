/**
 * simple1.js demonstrates the calling sequence of all the wildland fire behavior
 * classes (modules) and their fuel, moisture, wind, and slope input parameters.
 * 
 * The sample output diplays some of the more common fire behavior spread rate,
 * intensity, size, and location properties estimated by each module.
 */
import { describe, it, expect } from 'vitest'
import { parts, ppb, ppt, ppm } from './assertions.js'
expect.extend({ parts })

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from "#lib"
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib'
import { calcCanopyMidflameWsrf, calcCanopyFuelLoad, calcCanopyFuelHpua } from "#lib"
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib'
import { SpottingSurfaceFire, SpottingBurningPile } from "#lib"

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

//------------------------------------------------------------------------------
// 3 - Create a FuelBed structure using "gs4" fuels with 50 percent herb curing:
const fuelBed = new FuelBed({
    fuelModel,          // FuelModel reference from previous step
    curedHerb: 0.5})    // Cured herbaceous fuel fraction  

//------------------------------------------------------------------------------
// 4.1 - Create a FuelIgnition processor for the surface fire
// to apply the effects of fuel moisture content on the fuel bed ignition process:
const fuelIgnition = new FuelIgnition({
    fuelBed,                // FuelModel reference from previous step
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5}) // live stem wood fuel moisture content (fraction)

//------------------------------------------------------------------------------
// 4.2 - Create a CanopyFuelIgnition processor for the crown fire (if needed)
// to apply the effects of the *same* fuel moisture content on the crown fuels:
const canopyFuelIgnition = new CanopyFuelIgnition({
    fuelBed: canopyFuelBed, // CanopyFuelBed reference from step 1b
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5}) // live stem wood fuel moisture content (fraction)

//------------------------------------------------------------------------------
// 5 - The FireBehavior module requires the wind speed *at midflame height*.
// In the absence of field observations, midflame wind speed can be estimated
// from the 20-ft wind speed using a reduction factor. If there is no canopy
// above the fuel bed, the reduction factor is a property of the fuel beb depth:
const windSpeed20ft = 40*88 // 40 mph in ft/min
const fuelBedWsrf = fuelBed.midflameWsrf
// If there is a canopy above the fuel, it can be estimated from canopy properties:
const canopyBase = 10       // canopy base height (ft)
const canopyHeight = 50     // canopy height (ft)
const canopyCover = 0.25    // canopy cover (fraction)
const canopyWsrf = calcCanopyMidflameWsrf({canopyBase, canopyHeight, canopyCover})
// Per BehavePlus, apply the smaller of the two factors (i.e., the greatest reduction)
const wsrf = Math.min(canopyWsrf, fuelBedWsrf)
const midflameWindSpeed = windSpeed20ft * wsrf

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
    limitSpreadRateToWindSpeed: true})   // limit spread rate to wind speed (advanced use only; omit or leave as true)

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
    surfaceFuelHpua: fireBehavior.heatPerUnitArea})

// 7 - Create a FireShape from the FireBehavior to determine fire's elliptical shape.
// This example uses the FireBehavior results, but field observations could be used as well.
const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
const fireShape = new FireShape({
    headingSpreadRate,          // maximum fire spread rate (ft/min),
    headingFromNorth,           // fire direction of maximum spread (degrees clockwise from north)
    flameLength,                // flame length at fire head (ft)
    lengthWidthRatio            // fire ellipse length-to-width ratio
})

// 8 - Create a FireSize to determine the fire spread distance, size, and location
const fireSize = new FireSize({
    fireShape,          // FireShape reference from the above statement
    elapsedTime: 60,    // time since ignition (min)
    ignEast: 0,         // ignition point easting (x-coordinate)
    ignNorth: 0})       // ignition point northing (y-coordinate)

// 9 - Determine the fire spread rate, distance, intensity and position
// at the fire ellipse head and back fire vectors:
const head = new FireVectorHead({fireSize, calcFlameLength: true})
const back = new FireVectorBack({fireSize, calcFlameLength: true})

// 10 - Determine the fire spread rate, distance, intensity and position for a vector
// from the *ignition point* at some angle clockwise (beta) from the fire head:
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45, calcFlameLength: true})
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45, calcFlameLength: true})

// 11 - Determine the fire spread rate, distance, intensity and position for a vector
// from a *fire front* at some angle clockwise (psi) from the wind bearing (fire heading):
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})

// 12 - Determine the wind-driven surface fire spotting distance
const spotSurface = new SpottingSurfaceFire({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameLength: fireBehavior.flameLength // Surface fire flame length (ft)
})

// const burningPileFlameHt = 10
const spotPile = new SpottingBurningPile({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameHt: 10,                    // Burning pile flame height (ft)
})

describe('User case simple1.js results same as BehavePlus v5 and v6', () => {
    it('FuelBed results', () => {
        expect(fuelBed.depth).parts(2.1, ppb)
        expect(fuelBed.savr).parts(1631.128734, ppb)
        expect(fuelBed.bulkDensity).parts(0.2798548, ppm)
        expect(fuelBed.packingRatio).parts(0.008745, ppt)
        expect(fuelBed.dead.ovendryLoad).parts(0.1836547, ppm)
        expect(fuelBed.live.ovendryLoad).parts(0.4040404, ppm)
    })
    it('Midflame wind speed results', () => {
        expect(wsrf).parts(0.1721535, ppm)
        expect(midflameWindSpeed).parts(605.980572, ppm)
    })
    it('Fire behavior results', () => {
        expect(fireBehavior.headingSpreadRate).parts(12.849584, ppm)
        expect(fireBehavior.heatPerUnitArea).parts(1362.683306, ppm)
        expect(fireBehavior.firelineIntensity).parts(291.831896, ppm)
        expect(fireBehavior.flameLength).parts(6.125952, ppm)
        expect(fireBehavior.reactionIntensity).parts(5788.3122228, ppm)
        expect(fireBehavior.headingFromNorth).parts(86, ppt)
    })
    it('Fire size results', () => {
        expect(fireSize.backingDistance).parts(27.876477, ppm)
        expect(fireSize.headingDistance).parts(770.975046, ppm)
        expect(fireSize.hDistance).parts(146.601734, ppm)
        expect(fireSize.length).parts(798.851523, ppm)
        expect(fireSize.width).parts(293.203468, ppm)
        expect(fireSize.acres).parts(4.223156, ppm)
        expect(fireSize.perimeter).parts(27.4 * 66, ppt)
    })
    it('Crown fire results', () => {
        expect(canopyFuelLoad).parts(0.8, ppm)  // BP6 value
        expect(crownFire.heatPerUnitArea).parts(7762.683306, ppm)   // BP6 value
        expect(crownFire.heatPerUnitArea).parts(7762.683305776767)  // this value
        expect(fireBehavior.heatPerUnitArea).parts(1362.683306, ppm) // BP6 value
        expect(crownFire.headingSpreadRate).parts(435.767974674323, ppb)
        expect(crownFire.firelineIntensity).parts(56378.81303660871, ppb)
        expect(crownFire.flameLength).parts(294.06315638940436, ppb)
        expect(crownFire.powerOfFire).parts(437.04506229929234, ppb)
        expect(crownFire.powerOfWind).parts(143.9770401707434, ppb)
        expect(crownFire.powerRatio).parts(3.0355191479210677, ppb)
    })
    it('Surface fire spotting distance results', () => {
        // inputs
        expect(windSpeed20ft).toBe(40*88)
        expect(canopyHeight).toBe(50)
        expect(fireBehavior.flameLength).parts(6.125952, ppm)
        // outputs
        expect(spotSurface.firebrandHt).parts(73.187753, ppm)  // BP6 value
        expect(spotSurface.adjustedDownwindCoverHt).parts(50, ppb)
        expect(spotSurface.driftDistance).parts(928.052641, ppb)  // BP6 value
        expect(spotSurface.levelDistance).parts(1563.351003, ppm)  // BP6 value
    })
    it('Burning pile spotting distance results', () => {
        // inputs
        expect(windSpeed20ft).toBe(40*88)
        expect(canopyHeight).toBe(50)
        // outputs
        expect(spotPile.firebrandHt).parts(122, ppm)  // BP6 value
        expect(spotPile.adjustedDownwindCoverHt).parts(50, ppb)
        expect(spotPile.levelDistance).parts(1135.180940, ppm)  // BP6 value
    })
})