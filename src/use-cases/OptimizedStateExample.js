/**
Optimizes simpleState.js by keeping a copy of the current **params** object,
and only calling update(params) where necessitated by changes in params properties.
*/
import { OptimizedState } from "./optimizedState.js"
import { fmt } from './utils.js'

const start = performance.now()

const fmft = new OptimizedState()

const params = {
    curedHerb: 0.778,
    moistureDead1h: 0.05, moistureDead10h: 0.07, moistureDead100h: 0.09,
    moistureLiveHerb: 0.5, moistureLiveStem: 1.5,
    midflameWindSpeed: 880, windBearing: 90, slopeRatio: 0.25, aspect: 180}

const results = fmft.update(params)

const stop = performance.now()
console.table(results)
console.log(`OptimizedState.js elapsed time: ${fmt(stop-start)} msec`)
