/*  The FireCharMapExample.js demonstrates how to create a fire behavior characteristics
raster map (similar to FlamMap) using:
(1) spatially variable fuel, slope, aspect, and canopy site data from a source like LANDFIRE,
(2) and uniform wind speed, wind bearing, and fuel moisture values from a local weather station.

This example builds upon the use-case example *fbfmFireCharTable.js*

(1) The midflame wind speed is estimated by determining the 'wind speed reduction factor'
due to each cells' fuel bed depth and canopy cover, height, and base height.

(2) The FuelModel, FuelBed, and FuelIgnition are all pre-calculated for each of the 40 fuel models.

In this use case:

- The fuel model, slope, and aspect may vary from cell to cell,
and are provided by a source like LANDFIRE multiband geotiff file.

- While this example treats the fuel moisture contents, wind speed, and wind direction
as uniform across the map extent, it is easily modified to use spatially explicity values.

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
import { FireCharMap } from './FireCharMap.js'
import { mockLandfireGeotiff, displayMap } from './mockLandfireGeotiff.js'
import { fmt } from './utils.js'

// Handles processing after all the input map layers have been accessed
function makeFireCharMaps(rows, cols, params, fbfm40, slp, asp, cc, cbh, ch) {
    const cells = rows * cols
    const fmft = new FireCharMap(params)

    // Create spread rate, heading direction, and flame length output maps
    const ros = []
    const heading = []
    const flame = []

    // Simulate reading fuelModel, slope, aspect, canopy base/height/cover from LANDFIRE geotiff
    for (let i=0; i<cells; i++) {
        // Call FireCharMap.update() with current cell properties
        const {headingSpreadRate, headingFromNorth, flameLength} = fmft.update({
            fuelKey: fbfm40[i],
            slopeRatio: slp[i],
            aspect: asp[i],
            canopyBase: cbh[i],
            canopyHeight: ch[i],
            canopyCover: cc[i],
            windSpeed20ft: params.windSpeed20ft,
            windBearing: params.windBearing})
        // Store the results
        ros[i] = headingSpreadRate
        heading[i] = headingFromNorth
        flame[i] = flameLength
    }
    // Return result maps
    return {ros, heading, flame}
}

function example(rows, cols) {
    // 1 - Access the required LANDFIRE geotiff layers
    const {fbfm40, slp, asp, cc, cbh, ch} = mockLandfireGeotiff(rows, cols)

    // 2 - Establish spatially uniform moisture and wind parameters across the map extent
    const params = {
        curedHerb: 0,
        moistureDead1h: 0.05,
        moistureDead10h: 0.07,
        moistureDead100h: 0.09,
        moistureLiveHerb: 0.5,
        moistureLiveStem: 1.5,
        windSpeed20ft: 880,
        windBearing: 90
    }

    // 3 - Create fire behavior maps
    const start = performance.now()
    const {ros, heading, flame} = makeFireCharMaps(rows, cols, params, fbfm40, slp, asp, cc, cbh, ch)
    const stop = performance.now()

    // 4- Display maps
    displayMap(rows, cols, fbfm40, 'FBFM40')
    displayMap(rows, cols, ros, 'Spread Rate')
    console.log(`FireCharMapExample.js (${rows} x ${cols}) elapsed time: ${fmt(stop-start)} msec`)
    return {ros, heading, flame}
}

example(10, 10)