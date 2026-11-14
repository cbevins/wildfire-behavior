/**
 * SimpleStateExample.js refactors simple2.js as a state machine defined by the SimpleState class.
 * See the runSimplaeState() function at the end of the file for usage.
 * 
 * All inputs are specified in a single params object (use the 'ParamsBp6' object as a template).
 * 
 * This is not optimized in any manner in that all modules are updated with each update() call.
 * But it is still suitable for producing results in cases where the input params are (semi-) random or
 * unpredictable.  One such use-case is producing fire behavior maps (ala FlamMap)
 * from LANDFIRE fuel model, slope, and aspect geotiffs and local wind and fuel moisture inputs.
 */

import { SimpleState } from './SimpleState.js'
import { fmt } from './utils.js'
import { ParamsBp6 } from './Params.js'

export function runSimpleState(params={}) {
    const start = performance.now()
    const state = new SimpleState(params)
    const stop = performance.now()
    state.display()
    console.log(`SimpleStateExample.js elapsed time: ${fmt(stop-start)} msec`)
}

// Uncomment the line below to run this script
runSimpleState(ParamsBp6) 
