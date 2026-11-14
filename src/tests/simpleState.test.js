import { SimpleState } from '../use-cases/SimpleState.js'
import { bpFireShape, bpFirePerim, bpFireVector } from './Bp6Results.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb, ppm, ppt } from './assertions.js'
expect.extend({ parts })

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
//------------------------------------------------------------------------------

export const bpStateParams = {
    // Creating a FuelModel
    fuelKey: '10',
    // Updating the FuelBed
    curedHerb: 0.778,
    // Updating the FuelIgnition
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    // Updating the FireBehavior
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,                   // slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 95,                        // only used by vector scorch height
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    // Updating the FireSize
    elapsedTime: 60,
    ignEast:0,
    ignNorth:0,
    ignX:0,
    ignY:0,
    // Updating the FireVectors
    betaFromHead: 45,
    psiFromHead: 45,
    calcVectorFlameLength: true,
}

describe('simpleState use-case', () => {
    it(`Fuel Model 10 and 124 FireEllipse properties match BehavePlus v5 and v6 beta:`, () => {
        const state = new SimpleState()
        const fuel = [10, 124]
        for(let idx=0; idx<=1; idx++) {
            // These inputs differ between the 2 fuel models
            bpStateParams.fuelKey = fuel[idx]
            bpStateParams.betaFromHead = bpFireVector.betaFromHead[idx]
            bpStateParams.psiFromHead = bpFireVector.psiFromHead[idx]
            state.update(bpStateParams)

            const fire = state.fireBehavior 
            expect(fire.headingSpreadRate).parts(bpFireShape.headingSpreadRate[idx], ppb)
            expect(fire.headingFromNorth).parts(bpFireShape.headingFromNorth[idx], ppb)
            expect(fire.flameLength).parts(bpFireShape.flameLength[idx], ppb)
            expect(fire.lengthWidthRatio).parts(bpFireShape.lengthWidthRatio[idx], ppb)
            
            expect(state.fireSize.area).parts(bpFirePerim.area[idx], ppm)
            expect(state.fireSize.perimeter).parts(bpFirePerim.perimeter[idx], ppt)
            
            const head = state.headVector
            expect(head.spreadRate).parts(bpFireVector.headRos[idx])
            expect(head.distance).parts(bpFireVector.headDist[idx])
            expect(head.firelineIntensity).parts(bpFireVector.headFli[idx])
            expect(head.flameLength).parts(bpFireVector.headFlame[idx])
            expect(head.getScorchHeight(bpStateParams)).parts(bpFireVector.headScorch[idx])

            const back = state.backVector
            expect(back.spreadRate).parts(bpFireVector.backRos[idx])
            expect(back.distance).parts(bpFireVector.backDist[idx])
            expect(back.firelineIntensity).parts(bpFireVector.backFli[idx])
            expect(back.flameLength).parts(bpFireVector.backFlame[idx])
            expect(back.getScorchHeight(bpStateParams)).parts(bpFireVector.backScorch[idx])

            const beta5 = state.beta5Vector
            expect(beta5.spreadRate).parts(bpFireVector.beta5Ros[idx])
            expect(beta5.distance).parts(bpFireVector.beta5Dist[idx])
            expect(beta5.firelineIntensity).parts(bpFireVector.beta5Fli[idx])
            expect(beta5.flameLength).parts(bpFireVector.beta5Flame[idx])
            expect(beta5.getScorchHeight(bpStateParams)).parts(bpFireVector.beta5Scorch[idx])

            const beta6 = state.beta6Vector
            expect(beta6.spreadRate).parts(bpFireVector.beta6Ros[idx])
            expect(beta6.distance).parts(bpFireVector.beta6Dist[idx])
            expect(beta6.theta).parts(bpFireVector.beta6Theta[idx])
            expect(beta6.psi).parts(bpFireVector.beta6Psi[idx])
            expect(beta6.firelineIntensity).parts(bpFireVector.beta6Fli[idx], ppm)
            expect(beta6.flameLength).parts(bpFireVector.beta6Flame[idx])
            expect(beta6.getScorchHeight(bpStateParams)).parts(bpFireVector.beta6Scorch[idx], ppm)

            const psi = state.psiVector
            expect(psi.spreadRate).parts(bpFireVector.psiRos[idx])
            expect(psi.distance).parts(bpFireVector.psiDist[idx])
            expect(psi.firelineIntensity).parts(bpFireVector.psiFli[idx])
            expect(psi.flameLength).parts(bpFireVector.psiFlame[idx])
            expect(psi.getScorchHeight(bpStateParams)).parts(bpFireVector.psiScorch[idx])

            // Flanking is an *expansion rate* from the ellipse center,
            // and *NOT* a *fire spread rate* as the fire didn't start at the center except for no-wind, no-slope cases.
            // Therefore, fireline intensity and flame length must use beta or phi
            // let theta = new ThetaVector(fireEllipse, 90)
            // expect(theta.spreadRate).parts(bpFireVector.flankRos[idx])
            expect(state.fireSize.hSpreadRate).parts(bpFireVector.flankRos[idx])
            // expect(theta.distance).parts(bpFireVector.flankDist[idx])
            expect(state.fireSize.hDistance).parts(bpFireVector.flankDist[idx])
            // expect(theta.firelineIntensity).parts(bpFireVector.flankFli[idx])
            // expect(theta.flameLength).parts(bpFireVector.flankFlame[idx])
            // expect(theta.scorchHeight).parts(bpFireVector.flankScorch[idx])
        }
    })
})
