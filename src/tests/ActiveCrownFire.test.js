import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior } from '#lib/index.js'
import { CanopyFuelBed, CanopyFuelIgnition, ActiveCrownFireBehavior } from '#lib/ActiveCrownFire.js'
import * as Bp from './Bp6Inputs.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()
const fuelModel10 = catalog.get(10)
const fuelBed10 = new FuelBed({fuelModel: fuelModel10, curedHerb: Bp.fuelCuring.curedHerb})
const fuelIgnition10 = new FuelIgnition({fuelBed: fuelBed10, ...Bp.fuelMoisture})
const fireBehavior10 = new FireBehavior({fuelIgnition: fuelIgnition10, ...Bp.windSlope, ...Bp.options, slopeRatio: 0})

const crownBed = new CanopyFuelBed()
const crownIgnition = new CanopyFuelIgnition({fuelBed: crownBed, ...Bp.fuelMoisture})

function missingFuelIgnition() { new ActiveCrownFireBehavior({junk: 'junk'}) }
function missingWindSpeed20ft() { new ActiveCrownFireBehavior({fuelIgnition: crownIgnition, ...Bp.windSlope}) }
function missingCanopyBulkDensity() {new ActiveCrownFireBehavior({fuelIgnition: crownIgnition, ...Bp.windSlope, windSpeed20ft: 880}) }
function missingCanopyLength() {new ActiveCrownFireBehavior(
    {fuelIgnition: crownIgnition, ...Bp.windSlope, windSpeed20ft: 880, canopyBulkDensity: 0.02})
}

describe('ActiveCrownFireFuelModel Class', () => {
    it('properties match Fuel Model 10', () => {
        const crownBed = new CanopyFuelBed()
        expect(crownBed.fuelModel.number).toBe(255)
        expect(crownBed.fuelModel.code).toBe('crown')
        expect(crownBed.fuelModel.depth).toBe(fuelBed10.depth)
        expect(crownBed.fuelModel.deadMext).toBe(fuelBed10.deadMext)
    })
})

describe('CanopyFuelBed Class', () => {
    it('properties match BehavePlus v5 and v6 FuelModel 10:', () => {
        const crownBed = new CanopyFuelBed()
        expect(crownBed.bulkDensity).parts(0.552, ppb)
        expect(crownBed.depth).parts(1, ppb)
        expect(crownBed.liveMextFactor).parts(6.908948234294801, ppb)
        expect(crownBed.ovendryLoad).parts(0.552, ppb)
        expect(crownBed.packingRatio).parts(0.01725, ppb)
        expect(crownBed.packingRatioOpt).parts(0.0073478593798598172, ppb)
        expect(crownBed.packingRatioFraction).parts(2.3476224990480286, ppb)
        expect(crownBed.propagatingFluxRatio).parts(0.048317062998571636, ppb)
        expect(crownBed.reactionVelocityExp).parts(0.35878365060452616, ppb)
        expect(crownBed.reactionVelocityMax).parts(15.13331887756658, ppb)
        expect(crownBed.reactionVelocityOpt).parts(12.674359628667819, ppb)
        expect(crownBed.savr).parts(1764.3319812126388, ppb)
        expect(crownBed.savr15).parts(74108.915800396862, ppb)
        expect(crownBed.surfaceArea).parts(13.4665, ppb)

        expect(crownBed.dead.fineFuelLoad).parts(0.15704963842638839, ppb)
        expect(crownBed.dead.heat).parts(8000.0, ppb)
        expect(crownBed.dead.mext).parts(0.25, ppb)
        expect(crownBed.dead.mineralDamping).parts(0.41739692790939131, ppb)
        expect(crownBed.dead.netLoad).parts((1 - 0.0555) *0.13859233668341708, ppb)
        expect(crownBed.dead.ovendryLoad).parts(0.46, ppb)
        expect(crownBed.dead.reactionIntensityDry).parts(5539.9575948899355, ppb)
        expect(crownBed.dead.savr).parts(1888.8602386934672, ppb)
        expect(crownBed.dead.surfaceArea).parts(9.154, ppb)

        expect(crownBed.live.heat).parts(8000, ppb)
        expect(crownBed.live.mineralDamping).parts(0.41739692790939131, ppb)
        expect(crownBed.live.netLoad).parts((1 - 0.0555) * 0.092, ppb)
        expect(crownBed.live.ovendryLoad).parts(0.092, ppb)
        expect(crownBed.live.reactionIntensityDry).parts(3677.5200629895871, ppb)
        expect(crownBed.live.savr).parts(1500, ppb)

        expect(crownBed.midflameWsrf).parts(0.36210426360602416, ppb)
    })
    
    describe('CanopyFuelIgnition Class', () => {
        it('properties match BehavePlus v5 and v6 beta', () => {
            const crownBed = new CanopyFuelBed()
            const crownIgnition = new CanopyFuelIgnition({fuelBed: crownBed, ...Bp.fuelMoisture})
    
            expect(crownIgnition.dead.fineFuelMoisture).parts(0.05389207884883955, ppb)
            expect(crownIgnition.dead.fineWaterLoad).parts(0.008463731497256665, ppb)
            expect(crownIgnition.dead.moisture).parts(0.051626884422110553, ppb)
            expect(crownIgnition.dead.moistureDamping).parts(0.65206408989980214, ppb)
            expect(crownIgnition.dead.reactionIntensity).parts(3612.4074071954024, ppb)
    
            expect(crownIgnition.live.moisture).parts(1.5, ppb)
            expect(crownIgnition.live.moistureDamping).parts(0.59341294014849078, ppb)
            expect(crownIgnition.live.mext).parts(5.1935979022741359, ppb)
            expect(crownIgnition.live.reactionIntensity).parts(2182.287993033714, ppb)
    
            expect(crownIgnition.heatSink).parts(412.34037227937284, ppb)
            expect(crownIgnition.heatPreIgn).parts(746.993428042342, ppb)
            expect(crownIgnition.reactionIntensity).parts(5794.6954002291168, ppb)
            expect(crownIgnition.noWindSpreadRate).parts(0.67900860922904482, ppb)
        })
    })

    describe('ActiveCrownFireBehavior Class', () => {
        it('fails when params is missing fuelIgnition', () => {
            expect(() => missingFuelIgnition()).toThrow()
        })
        it('fails when params is missing windSpeed20ft', () => {
            expect(() => missingWindSpeed20ft()).toThrow()
        })
        it('fails when params is missing canopyBulkDensity', () => {
            expect(() => missingCanopyBulkDensity()).toThrow()
        })
        it('fails when params is missing canopyLength', () => {
            expect(() => missingCanopyLength()).toThrow()
        })

        it('Fuel Model 10 FireBehavior properties match BehavePlus v5 and v6 beta:', () => {
            const crownBed = new CanopyFuelBed()
            const crownIgnition = new CanopyFuelIgnition({fuelBed: crownBed, ...Bp.fuelMoisture})
            const params = {...Bp.params, fireBehavior: fireBehavior10, canopyFuelIgnition: crownIgnition,
                windSpeed20ft: 880, canopyBulkDensity: 0.02, canopyLength: 40}
            const crownBehavior = new ActiveCrownFireBehavior(params)
    
            expect(crownBehavior.fireBehavior.windFactor).parts(fireBehavior10.windFactor, ppb)
            expect(crownBehavior.fireBehavior.slopeFactor).parts(fireBehavior10.slopeFactor, ppb)
            expect(crownBehavior.headingSpreadRate).parts(3.34 * fireBehavior10.headingSpreadRate, ppb)
        })
    })
})