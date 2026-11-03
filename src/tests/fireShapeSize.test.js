import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import * as Bp from './Bp6Inputs.js'
import { bpFireShape, bpFireSize, bpFirePerim } from './Bp6Results.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb, ppm, ppt } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

describe('FireShape and FireSize Class', () => {
    it(`Fuel Model 10 and 124 FireEllipse properties match BehavePlus v5 and v6 beta:`, () => {
        const fuel = [10, 124]
        for(let idx=0; idx<=1; idx++) {
            const fuelModel = catalog.get(fuel[idx])
            const fuelBed = new FuelBed({fuelModel, curedHerb: Bp.fuelCuring.curedHerb})
            const fuelIgnition = new FuelIgnition({fuelBed, ...Bp.fuelMoisture})
            const fireBehavior = new FireBehavior({fuelIgnition, ...Bp.windSlope, ...Bp.options})
            
            const fireShape = new FireShape(fireBehavior)   // NOTE: fireBehavior IS an object
            for(let [prop, values] of Object.entries(bpFireShape)) {
                console.log(`Fuel Model ${fuel[idx]} prop ${prop} expect ${values[0]} received ${fireShape[prop]}`)
                expect(fireShape[prop]).parts(values[idx], ppb)
            }

            const fireSize = new FireSize({fireShape, ...Bp.firePosition})
            for(let [prop, values] of Object.entries(bpFireSize)) {
                console.log(`Fuel Model ${fuel[idx]} prop ${prop} expect ${values[0]} received ${fireSize[prop]}`)
                expect(fireSize[prop]).parts(values[idx], ppb)
            }
            expect(fireSize.area).parts(bpFirePerim.area[idx], ppm)
            expect(fireSize.perimeter).parts(bpFirePerim.perimeter[idx], ppt)
        }
    })
})
