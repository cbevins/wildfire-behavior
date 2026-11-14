// Example class for creating fire behavior characteristic raster maps similar to FlamMap.

import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, calcCanopyMidflameWsrf } from '#lib/index.js'

// All the input parameters required to run FireCharMap
export const FireCharMapParams = {
    // Temporally variable parameters, possibly from a local weather station
    curedHerb: 0, moistureDead1h: 0.05, moistureDead10h: 0.07, moistureDead100h: 0.09,
    moistureLiveHerb: 0.5, moistureLiveStem: 1.5, windSpeed20ft: 0, windBearing: 0,

    // Spatially variable parameters, possibly from a LANDFIRE multi-band geotiff
    fuelKey: 101, slopeRatio: 0, aspect: 180, canopyBase: 0, canopyHeight: 0, canopyCover: 0}

export class FireCharMap {
    constructor(params={}) {
        // Start with full compliment of default parameters,
        // then over-write with any client-specific values
        this.params = {...FireCharMapParams, ...params}

        // Create and store the FuelModel, FuelBed, FuelIgnition, and FireBehavior for each fuelKey
        this.fuelCatalog = new FuelModelCatalog()
        this.fbfm = new Array(256).fill(null)
        for (let fuelKey of this.fuelCatalog.getNumberKeys()) {
            const fuelModel = this.fuelCatalog.get(fuelKey)
            const fuelBed = new FuelBed({fuelModel, ...params})
            const fuelIgnition = new FuelIgnition({fuelBed, ...params})
            const fireBehavior = new FireBehavior({fuelIgnition, ...params})
            this.fbfm[fuelKey] = {fuelModel, fuelBed, fuelIgnition, fireBehavior}
        }
    }

    update(params) {
        // Get the cell's parameters
        const {fuelKey, slopeRatio, aspect, canopyBase, canopyHeight, canopyCover,
            windSpeed20ft, windBearing} = params

        // Use the fuelKey to access the current cell's applicable FuelBed, FuelIgnition, FireBehavior
        const fbfm = this.fbfm[fuelKey]
        const {fuelBed, fuelIgnition, fireBehavior} = fbfm

        // If fuel moisture is allowed to vary spatially (perhaps due to elev and aspect),
        // we would need to update the fuelKey's FuelIgnition here.

        // Update the midflame wind speed from fuel bed and canopy parameters.
        // (We *could* test for changed canopy params before updating the canopyWsrf)
        const canopyWsrf = calcCanopyMidflameWsrf({canopyBase, canopyHeight, canopyCover})
        const wsrf = Math.min(canopyWsrf, fuelBed.midflameWsrf)
        const midflameWindSpeed = windSpeed20ft * wsrf

        // Update the fire behavior
        fireBehavior.update({fuelIgnition, midflameWindSpeed, windBearing, slopeRatio, aspect,
            limitWindSpeedFactor: true, limitSpreadRateToWindSpeed: true})

        // Get and return the fire behavior characteristics of interest
        const {headingSpreadRate, headingFromNorth, flameLength} = fireBehavior
        return {headingSpreadRate, headingFromNorth, flameLength}
    }
}
