import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '../index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead,
    FireVectorLeftFlank, FireVectorPsi, FireVectorRightFlank } from '../index.js'
import * as Bp from './Bp6Inputs.js'
import { getScorchHeight} from '../lib/utils.js'
    
import { describe, it, expect } from 'vitest'
import { parts, ppm } from './assertions.js'
expect.extend({ parts })

const catalog = new FuelModelCatalog()

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
//------------------------------------------------------------------------------
let elapsed = Bp.firePosition.elapsedTime
const airTemp = 95
const midflame = 880

// const headingFromNorth = [87.573367385837855, 87.613728665173383]
// console.log('betaFromhead', beta5FromHead) prints: [ 317.42663261416214, 317.38627133482663 ]
const betaFromHead  = [360 - 42.573367385837855, 360 - 42.613728665173383]
const psiFromHead   = [360 - 42.573367385837855, 360 - 42.613728665173383]
// const beta5FromNorth  = [45, 45]
// const beta6FromNorth = [45, 45]
// const psiFromNorth   = [45, 45]
// const beta5FromUpslope  = [45, 45]
// const beta6FromUpslope = [45, 45]
// const psiFromUpslope   = [45, 45]

function scorchHeight(fli, airTemp=77, midflameWindSpeed=0) {
    const mph = midflameWindSpeed / 88
    return (fli > 0) ? ((63 / (140 - airTemp)) * fli**1.166667) /
        Math.sqrt(fli + mph * mph * mph) : 0
}

// beta.fli = head.fli * beta5.ros / head.ros
const beta5fli010 = (389.95413667947145 * 2.6256648650882601) / 18.551680325448835
// console.log('beta5fli010', beta5fli010) prints: 55.191166391033725
const beta5fl010 = 0.45 * Math.pow(beta5fli010, 0.46)
const beta5scht010 = scorchHeight(beta5fli010, airTemp, midflame)

// beta.fli = head.fli * beta5.ros / head.ros 
const beta5fli124 = (2467.9286450361865 * 6.8494531181657319) / 48.47042599399056
// console.log('beta5fli124', beta5fli124) prints: 348.7479469491235
const beta5fl124 = 0.45 * Math.pow(beta5fli124, 0.46)
const beta5scht124 = scorchHeight(beta5fli124, airTemp, midflame)

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
//------------------------------------------------------------------------------
// The FireEllipse methods should match these BehavePlus results for FBFM13 10 and FBFM40 124
const bpFireSize = {
    headRos: [18.551680325448835, 48.47042599399056],
    headDist: [1113.1008195269301, 2908.2255596394334],
    headFli: [389.95413667947145, 2467.9286450361865],
    headFlame: [6.9996889013229229, 16.35631663317114],
    headScorch: [39.580181786322299, 215.6827714],
    
    backRos: [0.39452649041938642, 1.0307803973340242],
    backDist: [23.671589425163184, 61.846823840041452],
    backFli: [8.2929003879841954, 52.483394093499705],
    backFlame: [1.1907414731175683, 2.7824194067294856],
    backScorch: [0.52018662032054752, 4.382412107193391,],
    
    beta5Ros: [2.6256648650882601, 6.8494531181657319],
    beta5Dist: [elapsed * 2.6256648650882601, elapsed * 6.8494531181657319],
    beta5Fli: [beta5fli010, beta5fli124],
    beta5Flame: [beta5fl010, beta5fl124],
    beta5Scorch: [beta5scht010, beta5scht124],
    
    beta6Ros: [2.6256648650882601, 6.8494531181657319],
    beta6Dist: [elapsed * 2.6256648650882601, elapsed * 6.8494531181657319],
    beta6Fli: [22.809320529051977, 144.22374220988746],
    beta6Flame: [1.896462213587117, 4.4296501098298906],
    beta6Scorch: [1.6814949065754006, 13.669401441568459],
    beta6Theta: [138.95912883244358, 138.998426267168],
    beta6Psi: [108.16241745554537, 108.185867694348],
    
    // The flank ROS is actually the *expansion rate* at 90 and 270 degrees from ellipse center,
    // and IS NOT a fire spread rate. So while the 'ros' and 'dist' properties are valid,
    // the Fli, Flame, and Scorch are not, as the fire did NOT come from the ellipse center.
    flankRos: [2.7053889424963877, 7.0684061120619655],
    flankDist: [162.32333654978328, 424.10436672371793],
    flankFli: [56.866957074505869, 359.89619544220318],
    flankFlame: [2.8870088099013929, 6.7461198324614715],
    flankScorch: [4.8023644521509334, 36.440372402518008],

    psiRos: [13.8977795836636, 36.2892704981354],
    psiDist: [elapsed * 13.8977795836636, elapsed * 36.2892704981354],
    psiFlame: [6.12882661647451, 14.3173998471815],
    psiFli: [292.129690908633, 1847.71081196849],
    psiScorch: [29.307635864149884, 169.80644998818718],
}

const fli = 389.95413667947145
console.log('Utils.getScorchHeight()', getScorchHeight(fli, airTemp, midflame), fli, airTemp, midflame)
console.log('Local scorchHeight()', scorchHeight(fli, airTemp, midflame), fli, airTemp, midflame)

describe('FireVector Classes', () => {
    it(`Fuel Model 10 and 124 FireEllipse properties match BehavePlus v5 and v6 beta:`, () => {
        const head = new FireVectorHead()
        const back = new FireVectorBack()
        const beta5 = new FireVectorBeta()
        const beta6 = new FireVectorBeta6()
        const psi = new FireVectorPsi()
        const left = new FireVectorLeftFlank()

        const fuel = [10, 124]
        for(let idx=0; idx<=1; idx++) {
            const fuelModel = catalog.get(fuel[idx])
            const fuelBed = new FuelBed(fuelModel, Bp.fuelCuring)
            const fuelIgnition = new FuelIgnition(fuelBed, Bp.fuelMoisture)
            const fireBehavior = new FireBehavior(fuelIgnition, Bp.windSlope, Bp.options)
            const fireShape = new FireShape(fireBehavior)
            const fireSize = new FireSize(fireShape, Bp.firePosition)
            
            head.update(fireSize, true)
            expect(head.spreadRate).parts(bpFireSize.headRos[idx])
            expect(head.distance).parts(bpFireSize.headDist[idx])
            expect(head.firelineIntensity).parts(bpFireSize.headFli[idx])
            expect(head.flameLength).parts(bpFireSize.headFlame[idx])
            // expect(head.getScorchHeight(midflame, airTemp)).parts(bpFireSize.headScorch[idx])
            console.log('FireVector.getScorchHeight()', head.getScorchHeight(midflame, airTemp),
                head.firelineIntensity, airTemp, midflame)

            back.update(fireSize, true)
            expect(back.spreadRate).parts(bpFireSize.backRos[idx])
            expect(back.distance).parts(bpFireSize.backDist[idx])
            expect(back.firelineIntensity).parts(bpFireSize.backFli[idx])
            expect(back.flameLength).parts(bpFireSize.backFlame[idx])
            // expect(back.getScorchHeight(midflame, airTemp)).parts(bpFireSize.backScorch[idx])

            beta5.update(fireSize, betaFromHead[idx])
            expect(beta5.spreadRate).parts(bpFireSize.beta5Ros[idx])
            expect(beta5.distance).parts(bpFireSize.beta5Dist[idx])
            expect(beta5.firelineIntensity).parts(bpFireSize.beta5Fli[idx])
            expect(beta5.flameLength).parts(bpFireSize.beta5Flame[idx])
            // expect(beta5.scorchHeight).parts(bpFireSize.beta5Scorch[idx])

            beta6.update(fireSize, betaFromHead[idx])
            expect(beta6.spreadRate).parts(bpFireSize.beta6Ros[idx])
            expect(beta6.distance).parts(bpFireSize.beta6Dist[idx])
            expect(beta6.theta).parts(bpFireSize.beta6Theta[idx])
            expect(beta6.psi).parts(bpFireSize.beta6Psi[idx])
            expect(beta6.firelineIntensity).parts(bpFireSize.beta6Fli[idx], ppm)
            expect(beta6.flameLength).parts(bpFireSize.beta6Flame[idx])
            // expect(beta6.scorchHeight).parts(bpFireSize.beta6Scorch[idx], ppm)

            psi.update(fireSize, psiFromHead[idx])
            expect(psi.spreadRate).parts(bpFireSize.psiRos[idx])
            expect(psi.distance).parts(bpFireSize.psiDist[idx])
            expect(psi.firelineIntensity).parts(bpFireSize.psiFli[idx])
            expect(psi.flameLength).parts(bpFireSize.psiFlame[idx])
            // expect(psi.scorchHeight).parts(bpFireSize.psiScorch[idx])

            // Flanking is an *expansion rate* from the ellipse center,
            // and NOT a spread rate from the ignition point!
            // Therefore, fireline intensity and flame length must use beta or phi
            // let theta = new ThetaVector(fireEllipse, 90)
            // expect(theta.spreadRate).parts(bpFireSize.flankRos[idx])
            // expect(theta.distance).parts(bpFireSize.flankDist[idx])
            // expect(theta.firelineIntensity).parts(bpFireSize.flankFli[idx])
            // expect(theta.flameLength).parts(bpFireSize.flankFlame[idx])
            // expect(theta.scorchHeight).parts(bpFireSize.flankScorch[idx])
        }
    })
})
