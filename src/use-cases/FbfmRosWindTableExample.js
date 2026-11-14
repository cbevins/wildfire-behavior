/**
Given a set of fire behavior input parameters, FbfmRosWindTable produces a table
of heading spread rate under midflame wind speed of 0-20 mph for the
53 'standard' fire behavior fuel models (13 per Anderson and 40 per Scott & Burgan).


Like the FbfmFireCharTable class, this also demonstrates some optimizations,
- The FuelModel - FuelBed pairs are pre-constructued for all 53 fuel models.
- The fbfmFireCharTable instance keeps a copy of the current input parameters.
- fuelBed.update() is only called if the FuelModel has curable herb
    and the 'curedHerb' input parameter has changed.
- fuelIgnition.update() is only called when the fuel model moisture content input
parameter has changed for one (or more) of its existing fuel moisture classes.
*/
import { FbfmRosWindTable, FbfmRosWindTableParams } from "./FbfmRosWindTable.js"
import { fmt } from './utils.js'

function example() {
    const start = performance.now()
    const fmft = new FbfmRosWindTable()

    let params = {...FbfmRosWindTableParams}
    let windRange = {min:0, max: 20, step:1}
    let rosTable = fmft.update(params, windRange, 'headingSpreadRate')

    let flTable = fmft.update(params, windRange, 'flameLength')
    const stop = performance.now()
    
    console.table(rosTable)
    console.table(flTable)
    console.log(`fbfmRosWindTable.js elapsed time: ${fmt(stop-start)} msec`)
}

example()