import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize, FireVectorBetaAtRightFlank } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead,
    FireVectorPsi } from '#lib/index.js'
import * as Bp from './Bp6Inputs.js'
import { bpFireVector } from './Bp6Results.js'
    
import { describe, it, expect } from 'vitest'
import { parts, ppm } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
//------------------------------------------------------------------------------
const airTemp = Bp.windSlope.airTemp
const midflameWindSpeed = Bp.windSlope.midflameWindSpeed
const calcVectorFlameLength = true

describe('FireVector Classes', () => {
    it(`Fuel Model 10 and 124 FireEllipse properties match BehavePlus v5 and v6 beta:`, () => {
        const head = new FireVectorHead()
        const back = new FireVectorBack()
        const beta5 = new FireVectorBeta()
        const beta6 = new FireVectorBeta6()
        const psi = new FireVectorPsi()
        const right = new FireVectorBetaAtRightFlank()

        const fuel = [10, 124]
        for(let idx=0; idx<=1; idx++) {
            const fuelModel = catalog.get(fuel[idx])
            const fuelBed = new FuelBed({fuelModel, curedHerb: Bp.fuelCuring.curedHerb})
            const fuelIgnition = new FuelIgnition({fuelBed, ...Bp.fuelMoisture})
            const fireBehavior = new FireBehavior({fuelIgnition, ...Bp.windSlope, ...Bp.options})
            const fireShape = new FireShape(fireBehavior)   // NOTE: fireBehavior IS an object
            const fireSize = new FireSize({fireShape, ...Bp.firePosition})

            const betaFromHead = bpFireVector.betaFromHead[idx]
            const psiFromHead = bpFireVector.psiFromHead[idx]
            const params = {fireSize, calcVectorFlameLength, betaFromHead, psiFromHead, airTemp, midflameWindSpeed}

            head.update(params)
            expect(head.spreadRate).parts(bpFireVector.headRos[idx])
            expect(head.distance).parts(bpFireVector.headDist[idx])
            expect(head.firelineIntensity).parts(bpFireVector.headFli[idx])
            expect(head.flameLength).parts(bpFireVector.headFlame[idx])
            expect(head.getScorchHeight(params)).parts(bpFireVector.headScorch[idx])

            back.update(params)
            expect(back.spreadRate).parts(bpFireVector.backRos[idx])
            expect(back.distance).parts(bpFireVector.backDist[idx])
            expect(back.firelineIntensity).parts(bpFireVector.backFli[idx])
            expect(back.flameLength).parts(bpFireVector.backFlame[idx])
            expect(back.getScorchHeight(params)).parts(bpFireVector.backScorch[idx])

            beta5.update(params)
            expect(beta5.spreadRate).parts(bpFireVector.beta5Ros[idx])
            expect(beta5.distance).parts(bpFireVector.beta5Dist[idx])
            expect(beta5.firelineIntensity).parts(bpFireVector.beta5Fli[idx])
            expect(beta5.flameLength).parts(bpFireVector.beta5Flame[idx])
            expect(beta5.getScorchHeight(params)).parts(bpFireVector.beta5Scorch[idx])

            beta6.update(params)
            expect(beta6.spreadRate).parts(bpFireVector.beta6Ros[idx])
            expect(beta6.distance).parts(bpFireVector.beta6Dist[idx])
            expect(beta6.theta).parts(bpFireVector.beta6Theta[idx])
            expect(beta6.psi).parts(bpFireVector.beta6Psi[idx])
            expect(beta6.firelineIntensity).parts(bpFireVector.beta6Fli[idx], ppm)
            expect(beta6.flameLength).parts(bpFireVector.beta6Flame[idx])
            expect(beta6.getScorchHeight(params)).parts(bpFireVector.beta6Scorch[idx], ppm)

            psi.update(params)
            expect(psi.spreadRate).parts(bpFireVector.psiRos[idx])
            expect(psi.distance).parts(bpFireVector.psiDist[idx])
            expect(psi.firelineIntensity).parts(bpFireVector.psiFli[idx])
            expect(psi.flameLength).parts(bpFireVector.psiFlame[idx])
            expect(psi.getScorchHeight(params)).parts(bpFireVector.psiScorch[idx])

            right.update(params)
            // Flanking is an *expansion rate* from the ellipse center,
            // and *NOT* a *fire spread rate* as the fire didn't start at the center except for no-wind, no-slope cases.
            // Therefore, fireline intensity and flame length must use beta or phi
            // let theta = new ThetaVector(fireEllipse, 90)
            // expect(theta.spreadRate).parts(bpFireVector.flankRos[idx])
            expect(fireSize.hSpreadRate).parts(bpFireVector.flankRos[idx])
            // expect(theta.distance).parts(bpFireVector.flankDist[idx])
            expect(fireSize.hDistance).parts(bpFireVector.flankDist[idx])
            // expect(theta.firelineIntensity).parts(bpFireVector.flankFli[idx])
            // expect(theta.flameLength).parts(bpFireVector.flankFlame[idx])
            // expect(theta.scorchHeight).parts(bpFireVector.flankScorch[idx])
        }
    })
})
