/**
FbfmFireCharTable.js produces a table of heading spread rate, direction, and flame length
for the 53 'standard' fire behavior fuel models (13 per Anderson and 40 per Scott & Burgan)
under a set of curing, moisture, wind, and slope conditions.

The table is suitable for creating a 'fire behavior characteristics chart', where each
fuel model is plotted on a chart with fire spread rate on the x-axis and
flame length on the y-axis.

It also demonstrates some optimizations,
- A set of FuelModel, FuelBed, FuelIgnition, and FireBehavior instances are
    constructued for each of the fuel models in advance.
- The FbfmFireCharTable instance keeps a copy of the current input parameters.
- fuelBed.update() is only called if the FuelModel has curable herb
    and the 'curedHerb' input parameter has changed.
- fuelIgnition.update() is only called when the fuel model moisture content input
parameter has changed for one (or more) of its existing fuel moisture classes.
- fireBehavior.update() is only called if one of the wind speed, direction, slope,
    or aspect input parameters have changed.
*/
import { FbfmFireCharTable } from './FbfmFireCharTable.js'
import { fmt } from './utils.js'

function changed(results) {
    let nChanged = 0
    for(let result of results) {
        if (result.changed) nChanged++
    }
    return nChanged
}

function table(title, items) {
    console.log(title)
    console.table(items)
}

function example() {
    const start = performance.now()

    const fmft = new FbfmFireCharTable()
    // let results = fmft.update(initialParams)
    // console.log('Initial Params', fmft.params)
    // console.log('Initial Results', results)

    // Change curedHerb
    const params = {...fmft.params}
    params.curedHerb = 0.5
    let results = fmft.update(params)
    table('After curedHerb=0.5', fmft.params)
    table('AFter curedHerb=0.5', results)
    console.log('Number of FuelBeds changed by curedHerb:', changed(results))

    // Change moistureDead100h
    params.moistureDead100h = 0.09
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead100h:', changed(results))

    // Change moistureDead10h
    params.moistureDead10h = 0.07
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead10h:', changed(results))

    // Change moistureDead1h
    params.moistureDead1h = 0.05
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureDead1h:', changed(results))

    // Change moistureLiveHerb
    params.moistureLiveHerb = 0.5
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureLiveHerb:', changed(results))

    // Change moistureLiveStem
    params.moistureLiveStem = 1.5
    results = fmft.update(params)
    console.log('Number of FuelBeds changed by moistureLiveStem:', changed(results))

    const stop = performance.now()
    console.log(`fbfmFireCharTable.js elapsed time: ${fmt(stop-start)} msec`)
}

example()