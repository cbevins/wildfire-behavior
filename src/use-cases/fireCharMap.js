/*  fireCharMaps.js demonstrates how to create a fire characteristics raster map (similar to FlamMap)
using spatial data from a source like LANDFIRE.  It builds upon the use-case example *fbfmFireCharTable.js*.

In this use case:

- The fuel model, slope, and aspect may vary from cell to cell,
and are provided by a source like LANDFIRE multiband geotiff file.

- While the fuel moisture contents, wind speed, and wind direction *could*
also vary across cells, in this example they are treated as constant across the map extent.

- The midflame wind speed must be estimated at each cell based on the wind speed at 20 ft
and the cell's fuel and/or canopy conditions.

- The fuel bed midflame wind speed reduction factor (fuelWsrf) is estimated from the
fuel bed depth, which is an internal property of the cell's fuel model.

- The canopy wind speed reduction factor (canopyWsrf) is estimated from the
canopy base, height, and cover, which are also available from LANDFIRE.

- We create a FireCharMap class that calculate fire spread rate, direction, and flame length for one cell.
The client calls FireCharMap.update(params) for each cell from the LANDFIRE geotiff.
The update() method returns a {headingSpreadRate, headingFromNorth, flameLength} object that the client
can then store in an output map or maps.

- All 40 FuelModel, FuelBed, and FuelIgnition instances are created in advance as an optimization,
so only the midflame wind speed and FireBehavior need to be updated for each cell.
*/
import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, calcCanopyMidflameWsrf } from '#lib/index.js'
import { fmt } from './utils.js'

const initialParams = {
    // Constant conditions
    curedHerb: 0,
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    windSpeed20ft: 0,
    windBearing: 0,
    // Provided by client map (i.e., LANDFIRE geotiff)
    fuelKey: 101,
    slopeRatio: 0,
    aspect: 180,
    canopyBase: 0,
    canopyHeight: 0,
    canopyCover: 0,
}

export class FireCharMap {
    constructor(params=initialParams) {
        this.#initClasses(params)
    }
    #initClasses(params) {
        this.params = params
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

    isChanged(props) {
        for(let prop of props) {
            if (this.params[prop] !== this.prevParams[prop]) return true
        }
        return false
    }

    update(params) {
        const {fuelKey, slopeRatio, aspect, canopyBase, canopyHeight, canopyCover,
            windSpeed20ft, windBearing} = params
        const fbfm = this.fbfm[fuelKey]

        // Because we assume uniform fuel moisture across map, no need to update FuelIgnition
        const {fuelBed, fireBehavior, fuelIgnition} = fbfm

        // Estimate the midflame wind speed
        // To Do - test for changed canopy params to update canopyWsrf
        const canopyWsrf = calcCanopyMidflameWsrf({canopyBase, canopyHeight, canopyCover})
        const wsrf = Math.min(canopyWsrf, fuelBed.midflameWsrf)
        const midflameWindSpeed = windSpeed20ft * wsrf

        fireBehavior.update({fuelIgnition, midflameWindSpeed, windBearing, slopeRatio, aspect,
            limitWindSpeedFactor: true, limitSpreadRateToWindSpeed: true})

        const {headingSpreadRate, headingFromNorth, flameLength} = fireBehavior
        return {headingSpreadRate, headingFromNorth, flameLength}
    }
}

// ------------------------------------------------------

// Just cycles through an array of values
function mockRaster(n, values) {
    const raster = []
    let idx = 0
    for(let i=0; i<n; i++) {
        if (idx === values.length) idx = 0
        raster[i] = values[idx++]
    }
    return raster
}

function mockCanopyRaster(n, values) {
    const cbh = []
    const ch = []
    const cc = []
    let idx = 0
    for(let i=0; i<n; i++) {
        if (idx === values.length) idx = 0
        cbh[i] = values[idx].b
        ch[i] = values[idx].h
        cc[i] = values[idx].c
        idx++
    }
    return {cbh, ch, cc}
}

function mockLandfireGeotiff(n=100) {
    const fuelCatalog = new FuelModelCatalog()
    const fbfm40 = mockRaster(n, fuelCatalog.getNumberKeys())
    const slp = mockRaster(n, [0, 0.1, 0.25, 0.5, 1, 2, 4, 8])
    const asp = mockRaster(n, [0, 45, 90, 135, 180, 225, 270, 315])
    const canopies = [{b:0, h:0, c:0},
        {b:10, h:20, c:0.5}, {b:10, h:20, c:1},
        {b:10, h:50, c:0.5}, {b:10, h:50, c:1},
        {b:10, h:100, c:0.5}, {b:10, h:100, c:1},
        {b:20, h:100, c:0.5}]
    const {cc, ch, cbh} = mockCanopyRaster(n, canopies)
    return {fbfm40, slp, asp, cc, cbh, ch}
}

function displayMap(rows, cols, values) {
    const table = []
    let idx = 0
    for(let row=0; row<rows; row++) {
        const line = []
        for(let col=0; col<cols; col++) {
            line.push(fmt(values[idx++]))
        }
        table.push(line)
    }
    console.table(table)
}
function example() {
    const start = performance.now()

    // Establish uniform moisture and wind parameters across the map extent
    const params = { ...initialParams,
        curedHerb: 0,
        moistureDead1h: 0.05,
        moistureDead10h: 0.07,
        moistureDead100h: 0.09,
        moistureLiveHerb: 0.5,
        moistureLiveStem: 1.5,
        windSpeed20ft: 0,
        windBearing: 0
    }

    const fmft = new FireCharMap()
    
    // Create mock LANDFIRE geotiff layers
    const rows = 10
    const cols = 10
    const cells = rows * cols
    const {fbfm40, slp, asp, cc, cbh, ch} = mockLandfireGeotiff(cells)
    const ros = []
    const heading = []
    const flame = []
    // Simulate reading fuelModel, slope, aspect, canopy base/height/cover from LANDFIRE geotiff
    for (let i=0; i<cells; i++) {
        const {headingSpreadRate, headingFromNorth, flameLength} = fmft.update({
            fuelKey: fbfm40[i],
            slopeRatio: slp[i],
            aspect: asp[i],
            canopyBase: cbh[i],
            canopyHeight: ch[i],
            canopyCover: cc[i],
            windSpeed20ft: params.windSpeed20ft,
            windBearing: params.windBearing})
        ros[i] = headingSpreadRate
        heading[i] = headingFromNorth
        flame[i] = flameLength
    }
    
    const stop = performance.now()

    displayMap(rows, cols, fbfm40)
    displayMap(rows, cols, ros)
    console.log(`fireCharMap.js (${rows} x ${cols}) elapsed time: ${fmt(stop-start)} msec`)
    return {ros, heading, flame}
}

example()