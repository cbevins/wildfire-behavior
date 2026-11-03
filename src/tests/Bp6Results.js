//------------------------------------------------------------------------------
// BehavePlus results used to test BehavePlus 5 and 6
//------------------------------------------------------------------------------

import { firePosition, windSlope } from './Bp6Inputs.js'
import { getScorchHeight } from '#lib/utils.js'

let elapsed = firePosition.elapsedTime
const airTemp = windSlope.airTemp
const midflameWindSpeed = windSlope.midflameWindSpeed

// beta.fli = head.fli * beta5.ros / head.ros
const beta5fli010 = (389.95413667947145 * 2.6256648650882601) / 18.551680325448835
// console.log('beta5fli010', beta5fli010) prints: 55.191166391033725
const beta5fl010 = 0.45 * Math.pow(beta5fli010, 0.46)
const beta5scht010 = getScorchHeight(beta5fli010, airTemp, midflameWindSpeed)

// beta.fli = head.fli * beta5.ros / head.ros 
const beta5fli124 = (2467.9286450361865 * 6.8494531181657319) / 48.47042599399056
// console.log('beta5fli124', beta5fli124) prints: 348.7479469491235
const beta5fl124 = 0.45 * Math.pow(beta5fli124, 0.46)
const beta5scht124 = getScorchHeight(beta5fli124, airTemp, midflameWindSpeed)

//------------------------------------------------------------------------------
// BehavePlus 5 and V6-beta values
//------------------------------------------------------------------------------
export const bpFireShape = {
    // inputs
    headingSpreadRate: [18.551680325448835, 48.47042599399056],
    flameLength: [6.9996889013229229, 16.35631663317114],
    headingFromNorth: [87.573367385837855, 87.613728665173383],
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

export const bpFireSize = {
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

// These are declared separately from bpFireSize betcause they differ by ppm and ppt instead of ppm
export const bpFirePerim = {
    area: [289850.691417, 45.422576205218135 * (66.0 * 660.0)],
    perimeter: [2476.2400999186934, 6469.7282289420209],
}

// The FireEllipse methods should match these BehavePlus results for FBFM13 10 and FBFM40 124
export const bpFireVector = {
    // const headingFromNorth = [87.573367385837855, 87.613728665173383]
    // console.log('betaFromhead', beta5FromHead) prints: [ 317.42663261416214, 317.38627133482663 ]
    betaFromHead: [360 - 42.573367385837855, 360 - 42.613728665173383],
    psiFromHead: [360 - 42.573367385837855, 360 - 42.613728665173383],

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
