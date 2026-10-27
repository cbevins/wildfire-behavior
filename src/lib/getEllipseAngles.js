/**
// The following are all 'beta', 'psi', and 'theta' angle computation methods
// that probably never need to be called directly by clients.
// They all take a reference to a FireShape instance with the following properties:
//  - fSpreadRate
//  - gSpreadRate
//  - hSpreadRate
*/

import {toDegrees, toRadians} from './utils.js'

// NOTE ON ANGLE PARAMETERS!!!
// All function angle arguements are ROTATIONAL degrees COUNTER-CLOCKWISE from fire heading

// Returns the 'beta' counter-clockwise rotation degrees from the fire heading direction
// from the fire ellipse ignition point
// asociated with the 'psi' degrees at the perimeter from the heading direction.
// Unimplemented by BehavePlus
// psiDegrees is rotational dgrees counter-clockwise from fire head
export function calcBetaFromPsi(fireShape, psiDegrees) {
    const thetaDegrees = calcThetaFromPsi(fireShape, psiDegrees)
    return calcBetaFromTheta(fireShape, thetaDegrees)
}

// Used only by betaFromPsi(), and unused by BehavePlus
// Note: at thetaDeg 162, betaDeg suddenly drops from 87.52 deg to 0
// where it remains until thetaDeg 199 when it pops back up to -87.52
// thetaDegrees is rotational dgrees counter-clockwise from fire head
export function calcBetaFromTheta(fireShape, thetaDegrees) {
    const f = fireShape.fSpreadRate
    const g = fireShape.gSpreadRate
    const h = fireShape.hSpreadRate
    const theta = toRadians(thetaDegrees)
    // The following are from Catchpole (1982) Eq 2
    const y = h * Math.sin(theta)       // y = R * t * h * sin(theta)
    const x = g + f * Math.cos(theta)   // x = R * t * (g + f * cos(theta))
    if (x === 0) {
        // theta intercepts perimeter at one of the beta (focus) latus rectum end points
        // so beta is either at 90 or 270 degrees
        return (thetaDegrees < 180) ? 90 : 270
    }
    let beta = Math.atan(y/x)
    // Quandrant adjustment
    if (beta < 0) beta +=  Math.PI
    if (thetaDegrees > 180) beta += Math.PI
    return toDegrees(beta)
}

// Returns psi degrees given beta degrees
// betaDegrees is rotational dgrees counter-clockwise from fire head
export function calcPsiFromBeta(fireShape, betaDegrees) {
    const thetaDegrees = calcThetaFromBeta(fireShape, betaDegrees)
    return calcPsiFromTheta(fireShape, thetaDegrees)
}

// Catchpole et.al. (1982) Equation 6
// Used only by psiFromBeta()
// thetaDegrees is rotational dgrees counter-clockwise from fire head
export function calcPsiFromTheta(fireShape, thetaDeg) {
    const f = fireShape.fSpreadRate
    const h = fireShape.hSpreadRate
    if (f * h * thetaDeg <= 0) return 0
    const theta = toRadians(thetaDeg)
    const tanPsi = (Math.tan(theta) * f) / h
    let psi = Math.atan(tanPsi)
    // Quadrant adjustment
    // 1st quadrant needs no adjustment
    if (theta <= 0.5 * Math.PI) { /* do nothing */ }
    // 2nd and 3rd quadrants
    else if (theta > 0.5 * Math.PI && theta <= 1.5 * Math.PI) {
        psi += Math.PI
    }
    // 4th quadrant
    else if (theta > 1.5 * Math.PI) {
        psi += 2 * Math.PI
    }
    return toDegrees(psi)
}

// Given the polar angle 'beta' from the fire ignition point to any point on the perimeter,
// this function determines the angle 'theta' from the fire ellipse center to that point.
// This is Catchpole et.al. (1982) Equation 5.
// Used only by psiFromBeta()
// betaDegrees is rotational dgrees counter-clockwise from fire head
export function calcThetaFromBeta(fireShape, betaDegrees) {
    const f = fireShape.fSpreadRate
    const g = fireShape.gSpreadRate
    const h = fireShape.hSpreadRate
    if (f <= 0 || h <= 0) return 0
    const b = toRadians(betaDegrees)
    const cosB = Math.cos(b)
    const cos2B = cosB * cosB
    const sin2B = 1 - cos2B
    const f2 = f * f
    const g2 = g * g
    const h2 = h * h
    const term = Math.sqrt(h2 * cos2B + (f2 - g2) * sin2B)  // term used in numerator
    const num = h * cosB * term - f * g * sin2B
    const denom = h2 * cos2B + f2 * sin2B
    const cosTheta = num / denom
    let theta = Math.acos(cosTheta)               // theta in radians when beta radians < PI
    if (b >= Math.PI) theta = 2 * Math.PI - theta // theta in radians when beta >= PI
    return toDegrees(theta)
}

// Used only by betaFromPsi(), Unused by BehavePlus
// psiDegrees is rotational dgrees counter-clockwise from fire head
export function calcThetaFromPsi(fireShape, psiDegrees) {
    const f = fireShape.fSpreadRate
    const h = fireShape.hSpreadRate
    if ( f <= 0 ) return 0
    const psi = toRadians(psiDegrees)
    const tanTheta = Math.tan(psi) * h / f
    let theta = Math.atan(tanTheta)
    // Quadrant adjustment
    if (psi <= 0.5 * Math.PI) { /* do nothing */ }
    else if (psi > 0.5 * Math.PI && psi <= 1.5 * Math.PI ) { theta += Math.PI }
    else if (psi > 1.5 * Math.PI ) { theta += 2 * Math.PI }
    return toDegrees(theta)
}
