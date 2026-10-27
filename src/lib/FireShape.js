/**
 * While the FireBehavior class produces fire spread rate and intensity in the direction
 * of maximum spread, the FireShape class expands fire behavior to two dimensions
 * under the assumption of uniform fuel, moisture, wind, and slope.  Under such
 * conditions, the fire assumes an elliptical shape with the perimeter expanding fastest
 * at the fire head and slowest at the fire back.
 * 
 * Four of the 7 inputs are provided by the FireBehavior class; passing a reference as
 * the 'inputs' object provides the 'headingSpreadRate', 'lengthWidthRatio', 'bearing',
 * and 'flameLength' properties.  Alternately, they can also be provided from direct
 * field observation.  These inputs determine the general ellipse shape, orientation,
 * and spread rates at various angles.
 */
import { toRadians } from "./utils.js"

export class FireShape {
    /**
     * 
     * @param {object} fireBehavior Reference to an object with properties:
     * {headingSpreadRate, lengthWidthRatio, bearing, flameLength}
     */
    constructor(fireBehavior) {
        this.init()
        this.update(fireBehavior)
    }
    init() {
        this.headingSpreadRate = 0
        this.lengthWidthRatio = 1
        this.flameLength = 0
        this.bearing = 0
        this.eccentricity = 0
        this.backingSpreadRate = 0
        this.majorExpansionRate = 0
        this.minorExpansionRate = 0
        this.fSpreadRate = 0
        this.hSpreadRate = 0
        this.gSpreadRate = 0
        this.latusRectumSpreadRate = 0
        this.effectiveWindSpeed = 0
        this.firelineIntensity = 0
        this.heatPerUnitArea = 0
        this.rotationDeg = 0
        this.rotationRad = 0
        this.rotationCos = 0
        this.rotationSin = 0
        this.rotationCosInv = 0
        this.rotationSinInv = 0
    }

    /**
     * 
     * @param {object} fireBehavior Object with properties 'headingSpreadRate', 'lengthWidthRatio', 'bearing', and 'flameLength'
     */
    update(fireBehavior) {
        // Get required fireBehavior input properties
        const {headingSpreadRate, bearing, lengthWidthRatio, flameLength} = fireBehavior

        // ellipse eccentricity [0..1] e = sqrt((a/b * a/b - 1) / (a/b))
        const lwr = lengthWidthRatio
        const eccentricity = Math.sqrt(lwr * lwr - 1) / lwr
        
        // Alternatively, e = sqrt((1 - b*b) / a*a)
        // eccentricity = Math.sqrt(1 - minorAxisRate**2 / majorAxisRate**2)

        // backing spread rate (ft/min)
        // BEHAVE and BehavePlus place the ignition point at one of the focii points
        const backingSpreadRate = headingSpreadRate * (1 - eccentricity) / (1 + eccentricity)

        // expansion rate of the major axis (ft/min)
        const majorExpansionRate = headingSpreadRate + backingSpreadRate

        // expansion rate of the minor axis (ft/min)
        const minorExpansionRate = majorExpansionRate / lwr

        // spread rate of the major semi-axis (ft/min)
        const fSpreadRate = 0.5 * majorExpansionRate

        // spread rate of the minor semi-axis (ft/min)
        const hSpreadRate = 0.5 * minorExpansionRate

        // expansion rate between the ignition point and center point (ft/min)
        const gSpreadRate = fSpreadRate - backingSpreadRate

        // The following is Catchpole & Alexander Equation 10, which produces the same
        // result as above, but requires knowing 'f' (half the major axis ros) in advance:
        // const gSpreadRateCatchpole = fSpreadRate * Math.sqrt(1 - lwr**-2)

        // Expansion rate of the latus rectum semi-chord (ft/min)
        // length = (2 * b*b) / a
        const latusRectumSpreadRate = hSpreadRate * hSpreadRate / fSpreadRate

        // Alternatively, length = 2a(1-e2)
        // latusRectumSpreadRate = fSpreadRate * (1 - eccentricity**2)

        // Effective (wind plus slope) wind speed (ft/min) estimated from lengthWidthRatio
        const effectiveWindSpeed = 88 * (4 * (lwr - 1))

        // Fireline intensity (BTU/ft/s) at head of fire
        // This is scaled back for the beta angles to derived fli, flame length, hpua, scorch
        const firelineIntensity = (flameLength > 0) ? (flameLength / 0.45)**( 1 / 0.46) : 0

        // Heat per unit area (Btu/ft2)
        const ros = headingSpreadRate
        const heatPerUnitArea = (ros > 0) ? (60 * firelineIntensity / ros) : 0

        // Rotation of ellipse from normal (counter-clockwise)
        const rotationDeg = (450 - bearing) % 360   // ellipse rotation degrees counter-clockwise from x-axis
        const rotationRad = toRadians(rotationDeg)

        const rotationCos = Math.cos(rotationRad)
        const rotationSin = Math.sin(rotationRad)

        // Inverse rotation of ellipse back to normal (clockwise)
        const rotationCosInv = Math.cos(-rotationRad)
        const rotationSinInv = Math.sin(-rotationRad)

        this.headingSpreadRate = headingSpreadRate
        this.lengthWidthRatio = lengthWidthRatio
        this.flameLength = flameLength
        this.bearing = bearing
        this.eccentricity = eccentricity
        this.backingSpreadRate = backingSpreadRate
        this.majorExpansionRate = majorExpansionRate
        this.minorExpansionRate = minorExpansionRate
        this.fSpreadRate = fSpreadRate
        this.hSpreadRate = hSpreadRate
        this.gSpreadRate = gSpreadRate
        this.latusRectumSpreadRate = latusRectumSpreadRate
        this.effectiveWindSpeed = effectiveWindSpeed
        this.firelineIntensity = firelineIntensity
        this.heatPerUnitArea = heatPerUnitArea
        this.rotationDeg = rotationDeg
        this.rotationRad = rotationRad
        this.rotationCos = rotationCos
        this.rotationSin = rotationSin
        this.rotationCosInv = rotationCosInv
        this.rotationSinInv = rotationSinInv
        return this
    }
}
