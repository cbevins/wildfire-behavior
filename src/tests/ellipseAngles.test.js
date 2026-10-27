import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '../index.js'
import { calcBetaFromPsi, calcBetaFromTheta, calcPsiFromBeta, calcPsiFromTheta,
    calcThetaFromBeta, calcThetaFromPsi } from '../index.js'
import * as Bp from './Bp6Inputs.js'
    
import { describe, it, expect } from 'vitest'
import { parts, ppb } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

describe('ellipseAngles.js functions', () => {
    it(`Beta-Theta-Psi call sequence works forward and backward:`, () => {
        // Build FireEllipse from direct input parameters for FM 10:
        let fuelKey = 10
        const fuelModel = catalog.get(fuelKey)
        const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
        const fuelIgnition = new FuelIgnition(fuelBed, Bp.fuelMoisture)
        const fireBehavior = new FireBehavior(fuelIgnition, Bp.windSlope, Bp.options)
        const fireShape = new FireShape(fireBehavior)
        
        expect(fireShape.headingSpreadRate).parts(fireBehavior.headingSpreadRate)
        expect(fireShape.lengthWidthRatio).parts(3.5015680219321221)
        expect(fireShape.firelineIntensity).parts(389.95413667947145)

        for(let thetaDegFromInput = 0; thetaDegFromInput<=360; thetaDegFromInput++) {
            const betaDegFromTheta = calcBetaFromTheta(fireShape, thetaDegFromInput)
            const psiDegFromTheta = calcPsiFromTheta(fireShape, thetaDegFromInput)
            
            const betaDegFromPsi = calcBetaFromPsi(fireShape, psiDegFromTheta)
            expect(betaDegFromPsi).parts(betaDegFromTheta)
            
            const psiDegFromBeta = calcPsiFromBeta(fireShape, betaDegFromTheta)
            expect(psiDegFromBeta).parts(psiDegFromTheta)
            
            const thetaDegFromPsi = calcThetaFromPsi(fireShape, psiDegFromTheta)
            const thetaDegFromBeta = calcThetaFromBeta(fireShape, betaDegFromTheta)
            expect(thetaDegFromPsi).parts(thetaDegFromInput)
            expect(thetaDegFromBeta).parts(thetaDegFromInput)
        }

        for(let betaDegFromInput = 0; betaDegFromInput<=360; betaDegFromInput++) {
            const thetaDegFromBeta = calcThetaFromBeta(fireShape, betaDegFromInput)
            const psiDegFromBeta = calcPsiFromBeta(fireShape, betaDegFromInput)
            const psiDegFromTheta = calcPsiFromTheta(fireShape, thetaDegFromBeta)
            expect(psiDegFromBeta).parts(psiDegFromTheta)

            const betaDegFromPsi = calcBetaFromPsi(fireShape, psiDegFromTheta)
            expect(betaDegFromPsi).parts(betaDegFromInput)

            const betaDegFromTheta = calcBetaFromTheta(fireShape, thetaDegFromBeta)
            expect(betaDegFromTheta).parts(betaDegFromInput)
            
            const thetaDegFromPsi = calcThetaFromPsi(fireShape, psiDegFromBeta)
            expect(thetaDegFromBeta).parts(thetaDegFromPsi)

            const betaDegFromTheta2 = calcBetaFromTheta(fireShape, thetaDegFromPsi)
            expect(betaDegFromTheta2).parts(betaDegFromInput)
        }
    })
})
