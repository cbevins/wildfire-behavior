import { FuelModelCatalog, FuelBed, FuelIgnition } from '../index.js'
import * as Bp from './Bp6Inputs.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

describe('FuelIgnition Class', () => {
    it('Fuel Model 10 FuelIgnition properties match BehavePlus v5 and v6 beta', () => {
        const fuelModel = catalog.get(10)
        const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
        const fuelIgnition = new FuelIgnition(fuelBed, Bp.fuelMoisture)

        expect(fuelIgnition.dead.fineFuelMoisture).parts(0.05389207884883955, ppb)
        expect(fuelIgnition.dead.fineWaterLoad).parts(0.008463731497256665, ppb)
        expect(fuelIgnition.dead.moisture).parts(0.051626884422110553, ppb)
        expect(fuelIgnition.dead.moistureDamping).parts(0.65206408989980214, ppb)
        expect(fuelIgnition.dead.reactionIntensity).parts(3612.4074071954024, ppb)

        expect(fuelIgnition.live.moisture).parts(1.5, ppb)
        expect(fuelIgnition.live.moistureDamping).parts(0.59341294014849078, ppb)
        expect(fuelIgnition.live.mext).parts(5.1935979022741359, ppb)
        expect(fuelIgnition.live.reactionIntensity).parts(2182.287993033714, ppb)

        expect(fuelIgnition.heatSink).parts(412.34037227937284, ppb)
        expect(fuelIgnition.heatPreIgn).parts(746.993428042342, ppb)
        expect(fuelIgnition.reactionIntensity).parts(5794.6954002291168, ppb)
        expect(fuelIgnition.noWindSpreadRate).parts(0.67900860922904482, ppb)

    })
    it('Fuel Model 124 FuelIgnition properties match BehavePlus v5 and v6 beta', () => {
        const fuelModel = catalog.get(124)
        const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
        const fuelIgnition = new FuelIgnition(fuelBed, Bp.fuelMoisture)

        expect(fuelIgnition.dead.fineFuelMoisture).parts(0.050405399380187531, ppb)
        expect(fuelIgnition.dead.fineWaterLoad).parts(0.0098866289779641001, ppb)
        expect(fuelIgnition.dead.moisture).parts(0.050100676116867547, ppb)
        expect(fuelIgnition.dead.moistureDamping).parts(0.74884711762612932, ppb)
        expect(fuelIgnition.dead.reactionIntensity).parts(7316.0935560142625, ppb)
        
        expect(fuelIgnition.live.moisture).parts(1.4039058919386871, ppb)
        expect(fuelIgnition.live.moistureDamping).parts(0.33380976126895767, ppb)
        expect(fuelIgnition.live.mext).parts(1.6581421656244677, ppb)
        expect(fuelIgnition.live.reactionIntensity).parts(5660.5993324823157, ppb)

        expect(fuelIgnition.heatPreIgn).parts(319.21640437931171 / 0.27985482530937067, ppb)
        expect(fuelIgnition.heatSink).parts(319.21640437931171, ppb)
        expect(fuelIgnition.reactionIntensity).parts(12976.692888496578, ppb)
        expect(fuelIgnition.noWindSpreadRate).parts(1.4333245773924823, ppb)
    })
})
