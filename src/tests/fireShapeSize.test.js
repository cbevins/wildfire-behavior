import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '../index.js'
import * as Bp from './Bp6Inputs.js'
    
import { describe, it, expect } from 'vitest'
import { parts, ppb, ppm, ppt } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

//------------------------------------------------------------------------------
// Fixed input values used in results computations
//------------------------------------------------------------------------------
// const airTemp = 95
const elapsed = 60
// const mapScale = 24000
// const midflame = 880
// const m = mapScale
// const m2 = m * m

// ['site.fire.vector.fromNorth', [45]],
// ['site.map.scale', [mapScale]],
// ['site.moisture.dead.tl1h', [0.05]],
// ['site.moisture.dead.tl10h', [0.07]],
// ['site.moisture.dead.tl100h', [0.09]],
// ['site.moisture.dead.category', [0.05]],
// ['site.moisture.live.herb', [0.5]],
// ['site.moisture.live.stem', [1.5]],
// ['site.moisture.live.category', [1.5]],
// ['site.slope.direction.aspect', [180]],
// ['site.slope.steepness.ratio', [0.25]],
// ['site.wind.direction.source.fromNorth', [270]],
// ['site.wind.speed.atMidflame', [midflame]],

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
// 'null' values means there are no BP5/6 results for comparison
// commented properties means no FireEllipse values have been generated yet
//------------------------------------------------------------------------------
const bpShapeProps = {
    // inputs
    headingSpreadRate: [18.551680325448835, 48.47042599399056],
    flameLength: [6.9996889013229229, 16.35631663317114],
    bearing: [87.573367385837855, 87.613728665173383],
    lengthWidthRatio: [3.5015680219321221, 3.5015819412846603],
    // setFireEllipse() outputs
    firelineIntensity: [389.95413667947145, 2467.9286450361865],
    eccentricity: [0.95835298387126711, 0.95835332217217739],
    backingSpreadRate: [0.39452649041938642, 1.0307803973340242],
    majorExpansionRate: [0.39452649041938642 + 18.551680325448835, 1.0307803973340242 + 48.47042599399056],
    minorExpansionRate: [2 * 2.7053889424963877, 2 * 7.0684061120619655],
    fSpreadRate: [9.4731034079341114, 1485.0361917397374 / elapsed],
    hSpreadRate: [2.7053889424963877, 424.10436672371787 / elapsed],
    gSpreadRate: [9.0785769175147255, 1423.189367899696 / elapsed],
}

const bpSizeProps = {
    // inputs
    // elapsedTime: [elapsed, elapsed],
    // ignX: [0, 0],
    // ignY: [0, 0],
    // ignEast: [0, 0],
    // ignNorth: [0, 0],
    // betaDegrees: [45, 45],
    // outputs
    headingDistance: [1113.1008195269301, 2908.2255596394334],
    backingDistance: [23.671589425163184, 61.846823840041452],
    fDistance: [elapsed * 9.4731034079341114, 1485.0361917397374],
    hDistance: [elapsed * 2.7053889424963877, 424.10436672371787],
    gDistance: [elapsed * 9.0785769175147255, 1423.189367899696],
    length: [1136.7724089520932, 2970.0723834794749],
    width: [324.64667309956644, 848.20873344743575],
}

// The following are off by a bit more than ppb
const area = [289850.691417, 45.422576205218135 * (66.0 * 660.0)]
const perimeter = [2476.2400999186934, 6469.7282289420209]

describe('FireShape and FireSize Class', () => {
    it(`Fuel Model 10 and 124 FireEllipse properties match BehavePlus v5 and v6 beta:`, () => {
        const fuel = [10, 124]
        for(let idx=0; idx<=1; idx++) {
            const fuelModel = catalog.get(fuel[idx])
            const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
            const fuelIgnition = new FuelIgnition(fuelBed, Bp.fuelMoisture)
            const fireBehavior = new FireBehavior(fuelIgnition, Bp.windSlope, Bp.options)
            
            const fireShape = new FireShape(fireBehavior)
            for(let [prop, values] of Object.entries(bpShapeProps)) {
                console.log(`Fuel Model ${fuel[idx]} prop ${prop} expect ${values[0]} received ${fireShape[prop]}`)
                expect(fireShape[prop]).parts(values[idx], ppb)
            }

            const fireSize = new FireSize(fireShape, Bp.firePosition)
            for(let [prop, values] of Object.entries(bpSizeProps)) {
                console.log(`Fuel Model ${fuel[idx]} prop ${prop} expect ${values[0]} received ${fireSize[prop]}`)
                expect(fireSize[prop]).parts(values[idx], ppb)
            }
            expect(fireSize.area).parts(area[idx], ppm)
            expect(fireSize.perimeter).parts(perimeter[idx], ppt)
        }
    })
})
