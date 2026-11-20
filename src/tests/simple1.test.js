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
import { calcMidflameWsrf, calcCanopyMidflameWsrf, calcCanopyFuelLoad, calcCanopyFuelHpua } from "#lib"
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib'
import { SpottingSurfaceFire, SpottingBurningPile, spottingTopography } from "#lib"

//------------------------------------------------------------------------------
// 1 - Define available fuel models.

// 1.1 - Create a catalog of the 13 Anderson and 40 Scott & Burgan surface fire behavior fuel models:
const fuelCatalog = new FuelModelCatalog()

// 1.2 - Create a canopy fuel model if crown fire behavior is needed:
// (Same as step 3 for surface fuels, but no catalog fuel model or curing is needed.)
const canopyFuelBed = new CanopyFuelBed()

//------------------------------------------------------------------------------
// 2 - Select a surface fuel model.
// Here we use Scott and Burgan's fuel model "gs4" (number 124) for "high load, humid climate grass-shrub"
// which has all 3 dead fuel size classes, live stemwood, and curable herbs:
const fuelKey = "gs4"
const fuelModel = fuelCatalog.get(fuelKey)

//------------------------------------------------------------------------------
// 3 - Apply fuel model and curing conditions to create a fire simulation fuel bed.
// Seventeen of the standard fire behavior fuel models have curable herbaceous fuels.
// Here we use the "gs4" fuel mode from above with 50 percent herb curing:
const fuelBed = new FuelBed({
    fuelModel,          // FuelModel reference from previous step
    curedHerb: 0.5,     // Cured herbaceous fuel fraction  
})

//------------------------------------------------------------------------------
// 4 - Apply fuel moisture conditions to the surface and/or crown fuels
// to determine fuel ignition and fire properties under no slope or wind:

// 4.1 - Create a FuelIgnition processor for the surface fire:
const fuelIgnition = new FuelIgnition({
    fuelBed,                // FuelModel reference from step 2
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5,  // live stem wood fuel moisture content (fraction)
})

// 4.2 - Create a CanopyFuelIgnition processor for the crown fire (if needed)
// to apply the effects of the *same* fuel moisture contents on the crown fuels:
const canopyFuelIgnition = new CanopyFuelIgnition({
    fuelBed: canopyFuelBed, // CanopyFuelBed reference from step 1.2
    moistureDead1h: 0.05,   // dead 1-h fuel moisture content (fraction)
    moistureDead10h: 0.07,  // dead 10-h fuel moisture content (fraction)
    moistureDead100h: 0.09, // dead 100-h fuel moisture content (fraction)
    moistureLiveHerb: 0.5,  // live herbaceous fuel moisture content (fraction)
    moistureLiveStem: 1.5,  // live stem wood fuel moisture content (fraction)
})

//------------------------------------------------------------------------------
// 5 - Determine the surface fuel *midflame* wind speed.
// In the absence of field observations, midflame wind speed can be estimated
// from the 20-ft wind speed and the fuel bed depth and canopy properties:
const canopyBase = 10       // canopy base height (ft)
const canopyHeight = 50     // canopy height (ft)
const canopyCover = 0.25    // canopy cover (fraction)
const wsrf = calcMidflameWsrf({
    fuelBed,                // FuelBed reference from step 3
    canopyBase,             // canopy base height (ft)
    canopyHeight,           // canopy height (ft)
    canopyCover,            // canopy cover (fraction)
})

// Optionally, we could calculate just the *canopy* reduction factor:
const canopyWsrf = calcCanopyMidflameWsrf({canopyBase, canopyHeight, canopyCover})
// And we could retrieve just the *fuel bed* reduction factor
const fuelBedWsrf = fuelBed.midflameWsrf

// Apply the midflame wind speed reduction factor to the 20-ft wind speed
const windSpeed20ft = 40*88 // 40 mph in ft/min
const midflameWindSpeed = windSpeed20ft * wsrf

//------------------------------------------------------------------------------
// 6 - Apply wind and slope effects to the surface and crown ignition properties
// to determine maximum spread rate, intensity, and direction of maximum spread:

// 6.1 - Create a FireBehavior processor for the surface fire:
const fireBehavior = new FireBehavior({
    fuelIgnition,               // FuelIgnition reference from step 4.1
    midflameWindSpeed,          // midflame wind speed (ft/min)
    windBearing: 90,            // wind heading (compass degrees clockwise from north)
    slopeRatio: 0.25,           // slope rise/reach ratio (0.25 = 14.03624347 degrees)
    aspect: 180,                // slope aspect (down slope direction) (compass degrees clockwise from noth)
    limitWindSpeedFactor: true, // limit effective wind speed by fire intensity (advanced use only; omit or leave as true)
    limitSpreadRateToWindSpeed: true,   // limit spread rate to wind speed (advanced use only; omit or leave as true)
})

// 6.2 - Create a FireBehavior processor for the crown fire (if needed):
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
    canopyFuelIgnition, // CanopyFuelIgnition reference from step 4.2
    windSpeed20ft,      // wind speed at 20-ft (ft/min)
    canopyFuelHpua,     // canopy fuel heat per unit area (Btu/ft2)
    surfaceFuelHpua: fireBehavior.heatPerUnitArea,  // Btu/ft2
})

//------------------------------------------------------------------------------
// 7 - Determine surface fire's elliptical shape and expansion rates.
// Here we use the FireBehavior results from step 6.1,
// but actual field observation values could be used as well:
const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
const fireShape = new FireShape({
    headingSpreadRate,          // maximum fire spread rate (ft/min),
    headingFromNorth,           // fire direction of maximum spread (degrees clockwise from north)
    flameLength,                // flame length at fire head (ft)
    lengthWidthRatio,           // fire ellipse length-to-width ratio
})

//------------------------------------------------------------------------------
// 8 - Determine surface fire ellipse size and perimeter at some time after ignition:
const fireSize = new FireSize({
    fireShape,          // FireShape reference from step 7
    elapsedTime: 60,    // time since ignition (min)
    ignEast: 0,         // ignition point easting (x-coordinate)
    ignNorth: 0,        // ignition point northing (y-coordinate)
})

//------------------------------------------------------------------------------
// 9 - Determine the fire ellipse spread rate, distance, intensity and position
// along various fire vectors:

// 9.1 - Fire vectors at the ellipse head and back:
const head = new FireVectorHead({fireSize, calcFlameLength: true})
const back = new FireVectorBack({fireSize, calcFlameLength: true})

// 9.2 - Fire vectors from the *ignition point* at some angle clockwise (beta)
// from the fire ellipse head:
const beta5 = new FireVectorBeta({fireSize, betaFromHead: 45, calcFlameLength: true})
const beta6 = new FireVectorBeta6({fireSize, betaFromHead: 45, calcFlameLength: true})

// 9.3 - Fire vector from a *fire front* at some angle clockwise (psi)
// from the wind bearing (or the fire ellipse heading):
const psi = new FireVectorPsi({fireSize, psiFromHead: 45})

//------------------------------------------------------------------------------
// 10 - Determine surface fire spotting distance

// 10.1 - First determine spotting distance over flat terrain:
const spotSurfaceFlat = new SpottingSurfaceFire({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameLength: fireBehavior.flameLength // Surface fire flame length (ft)
})

// 10.2 - Then apply effects of topography on spotting distance
const spotSurfaceTopo = spottingTopography({
    flatDistance: spotSurfaceFlat.levelDistance, // Spotting distance over flat terrain (ft)
    location: 'ridgeTop',       // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
    ridgeToValleyDist: 2*5280,  // Horizontal distance from ridge top to valley bottom (ft)
    ridgeToValleyElev: 3000,    // Vertical distance from ridge top to valley bottom (ft)
})

// 10.3 - Independently, we can also determine spotting distance from an burning pile
const spotPileFlat = new SpottingBurningPile({
    downwindCoverHt: canopyHeight,  // Downwind tree/vegetation cover height (ft).
    downwindOpenCanopy: false,      // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
    windSpeed20ft,                  // Wind speed at 20 ft (ft/min).
    flameHt: 10,                    // Burning pile flame height (ft)
})

const spotPileTopo = spottingTopography({
    flatDistance: spotPileFlat.levelDistance, // Spotting distance over flat terrain (ft)
    location: 'ridgeTop',       // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
    ridgeToValleyDist: 2*5280,  // Horizontal distance from ridge top to valley bottom (ft)
    ridgeToValleyElev: 3000,    // Vertical distance from ridge top to valley bottom (ft)
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
    it('Surface fire ellipse vector results', () => {
        expect(head.spreadRate).parts(12.849584098887162, ppb)
        expect(back.spreadRate).parts(0.4646079545918958, ppb)
        expect(beta5.spreadRate).parts(2.6203305920807893, ppb)
        expect(beta6.spreadRate).parts(2.6203305920807893, ppb)
        expect(psi.spreadRate).parts(9.393077107253966, ppb)
        expect(head.flameLength).parts(6.125951887823439, ppb)
        expect(back.flameLength).parts(1.3302842945801285, ppb)
        expect(beta5.flameLength).parts(2.948006311665555, ppb)
        expect(beta6.flameLength).parts(2.06576053118997, ppb)
        expect(psi.flameLength).parts(5.30366686324129, ppb)
    })
    it('Surface fire spotting distance results', () => {
        // inputs
        expect(windSpeed20ft).toBe(40*88)
        expect(canopyHeight).toBe(50)
        expect(fireBehavior.flameLength).parts(6.125952, ppm)
        // outputs
        expect(spotSurfaceFlat.firebrandHt).parts(73.187753, ppm)  // BP6 value
        expect(spotSurfaceFlat.adjustedDownwindCoverHt).parts(50, ppb)
        expect(spotSurfaceFlat.driftDistance).parts(928.052641, ppb)  // BP6 value
        expect(spotSurfaceFlat.levelDistance).parts(1563.351003, ppm)  // BP6 value
        expect(spotSurfaceTopo).parts(2169.960676702202)
    })
    it('Burning pile spotting distance results', () => {
        // confirm inputs
        expect(windSpeed20ft).toBe(40*88)
        expect(canopyHeight).toBe(50)
        // outputs
        expect(spotPileFlat.firebrandHt).parts(122, ppm)  // BP6 value
        expect(spotPileFlat.adjustedDownwindCoverHt).parts(50, ppb)
        expect(spotPileFlat.levelDistance).parts(1135.180940, ppm)  // BP6 value
        expect(spotPileTopo).parts(1596.088333, ppm)  // BP6 value
    })
})