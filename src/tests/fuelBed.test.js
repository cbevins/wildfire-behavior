import { FuelModelCatalog, FuelBed } from '../index.js'
import * as Bp from './Bp6Inputs.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb } from './assertions.js'
expect.extend({ parts })

// Functions meant to *throw* and Error
function fuelCuringNotAnObject() { const bed = new FuelBed(gr1, 0.5) }
function fuelCuringUnknownKey() { const bed = new FuelBed(gr1, {unknown: 0}) }

const catalog = new FuelModelCatalog()
const gr1 = catalog.get('gr1')

describe('FuelBed Class', () => {
    it('inherits correct fuel model data', () => {
        const bed = new FuelBed(gr1, {curedHerb: 0})
        expect(bed.fuelModel.number).toBe(101)
        expect(bed.fuelModel.code).toBe('gr1')
    })

    it('fails when fuelCuring is not an object', () => {
        expect(() => fuelCuringNotAnObject()).toThrow()
    })

    it('fails when fuel particle curing key is not in the fuelCuring object', () => {
        expect(() => fuelCuringUnknownKey()).toThrow()
    })

    it('apportions curable fuels between live and dead categories', () => {
        let bed = new FuelBed(gr1, {curedHerb: 0})
        expect(bed.dead.ovendryLoad).toBe(gr1.particles[0].ovendryLoad)
        expect(bed.live.ovendryLoad).toBe(gr1.particles[1].ovendryLoad)

        // FuelBed cannot be updated; a new instance must be created for every fuel model-curing combination
        bed = new FuelBed(gr1, {curedHerb: 0.5})
        expect(bed.dead.ovendryLoad).toBe(gr1.particles[0].ovendryLoad + gr1.particles[1].ovendryLoad/2)
        expect(bed.live.ovendryLoad).toBe(gr1.particles[1].ovendryLoad/2)

        bed = new FuelBed(gr1, {curedHerb: 1})
        expect(bed.dead.ovendryLoad).toBe(gr1.particles[0].ovendryLoad + gr1.particles[1].ovendryLoad)
        expect(bed.live.ovendryLoad).toBe(0)
    })
    
    it('Fuel Model 10 FuelBed properties match BehavePlus v5 and v6 beta:', () => {
        const fuelModel = catalog.get(10)
        const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
        
        expect(fuelBed.bulkDensity).parts(0.552, ppb)
        expect(fuelBed.depth).parts(1, ppb)
        expect(fuelBed.liveMextFactor).parts(6.908948234294801, ppb)
        expect(fuelBed.ovendryLoad).parts(0.552, ppb)
        expect(fuelBed.packingRatio).parts(0.01725, ppb)
        expect(fuelBed.packingRatioOpt).parts(0.0073478593798598172, ppb)
        expect(fuelBed.packingRatioFraction).parts(2.3476224990480286, ppb)
        expect(fuelBed.propagatingFluxRatio).parts(0.048317062998571636, ppb)
        expect(fuelBed.reactionVelocityExp).parts(0.35878365060452616, ppb)
        expect(fuelBed.reactionVelocityMax).parts(15.13331887756658, ppb)
        expect(fuelBed.reactionVelocityOpt).parts(12.674359628667819, ppb)
        expect(fuelBed.savr).parts(1764.3319812126388, ppb)
        expect(fuelBed.savr15).parts(74108.915800396862, ppb)
        expect(fuelBed.surfaceArea).parts(13.4665, ppb)

        expect(fuelBed.dead.fineFuelLoad).parts(0.15704963842638839, ppb)
        expect(fuelBed.dead.heat).parts(8000.0, ppb)
        expect(fuelBed.dead.mext).parts(0.25, ppb)
        expect(fuelBed.dead.mineralDamping).parts(0.41739692790939131, ppb)
        expect(fuelBed.dead.netLoad).parts((1 - 0.0555) *0.13859233668341708, ppb)
        expect(fuelBed.dead.ovendryLoad).parts(0.46, ppb)
        expect(fuelBed.dead.reactionIntensityDry).parts(5539.9575948899355, ppb)
        expect(fuelBed.dead.savr).parts(1888.8602386934672, ppb)
        expect(fuelBed.dead.surfaceArea).parts(9.154, ppb)

        expect(fuelBed.live.heat).parts(8000, ppb)
        expect(fuelBed.live.mineralDamping).parts(0.41739692790939131, ppb)
        expect(fuelBed.live.netLoad).parts((1 - 0.0555) * 0.092, ppb)
        expect(fuelBed.live.ovendryLoad).parts(0.092, ppb)
        expect(fuelBed.live.reactionIntensityDry).parts(3677.5200629895871, ppb)
        expect(fuelBed.live.savr).parts(1500, ppb)

        expect(fuelBed.midflameWsrf).parts(0.36210426360602416, ppb)
    })
    
    it('Fuel Model 124 FuelBed properties match BehavePlus v5 and v6 beta:', () => {
        const fuelModel = catalog.get(124)
        const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)

        expect(fuelBed.surfaceArea).parts(29.062930440771346, ppb)
        expect(fuelBed.savr).parts(1631.1287341340956, ppb)
        expect(fuelBed.bulkDensity).parts(0.27985482530937067, ppb)

        expect(fuelBed.liveMextFactor).parts(2.1558023634049093, ppb)
        expect(fuelBed.packingRatio).parts(0.0087454632909178334, ppb)
        expect(fuelBed.packingRatioOpt).parts(0.0078357185983373434, ppb)
        expect(fuelBed.packingRatioFraction).parts(1.11610226696675, ppb)
        expect(fuelBed.propagatingFluxRatio).parts(0.035258653482453904, ppb)
        expect(fuelBed.reactionVelocityExp).parts( 0.38177694461561407, ppb)
        expect(fuelBed.reactionVelocityMax).parts(14.944549319976806, ppb)
        expect(fuelBed.reactionVelocityOpt).parts(14.908876941781589, ppb)

        expect(fuelBed.dead.mineralDamping).parts(0.41739692790939131, ppb)
        expect(fuelBed.dead.netLoad).parts((1 - 0.0555) * 0.20777819078484744, ppb)
        expect(fuelBed.dead.reactionIntensityDry).parts(9769.8093293148086, ppb)
        expect(fuelBed.dead.savr).parts(1682.0151742581315, ppb)
        expect(fuelBed.dead.surfaceArea).parts(11.030790863177224, ppb)

        expect(fuelBed.live.mineralDamping).parts(0.41739692790939131, ppb)
        expect(fuelBed.live.netLoad).parts((1 - 0.0555) * 0.36064279155188239, ppb)
        expect(fuelBed.live.reactionIntensityDry).parts(16957.560830348066, ppb)
        expect(fuelBed.live.savr).parts(1600, ppb)
    })

})