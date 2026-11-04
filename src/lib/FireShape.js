// @ts-nocheck
/**
 * While the FireBehavior class produces fire spread rate and intensity in the direction
 * of maximum spread, the FireShape class expands fire behavior to two dimensions
 * under the assumption of uniform fuel, moisture, wind, and slope.  Under such
 * conditions, the fire assumes an elliptical shape with the perimeter expanding fastest
 * at the fire head and slowest at the fire back.
 * 
 * Four of the 7 inputs are provided by the FireBehavior class; passing a reference as
 * the 'inputs' object provides the 'headingSpreadRate', 'lengthWidthRatio', 'headingFromNorth',
 * and 'flameLength' properties.  Alternately, they can also be provided from direct
 * field observation.  These inputs determine the general ellipse shape, orientation,
 * and spread rates at various angles.
 */
import { toRadians } from "./utils.js"

export const FireShapeProps = [
    // Save whatever props are needed for use further downstream
    {key: 'headingSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'lengthWidthRatio', type: 'lengthToWidthRatio', init: 1, desc: ''},
    {key: 'flameLength', type: 'flameLength', init: 0, desc: ''},
    {key: 'headingFromNorth', type: 'bearing', init: 0, desc: ''},
    {key: 'eccentricity', type: 'eccentricity', init: 0, desc: ''},
    {key: 'backingSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'majorExpansionRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'minorExpansionRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'fSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'hSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'gSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'latusRectumSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'effectiveWindSpeed', type: 'windSpeed', init: 0, desc: ''},
    {key: 'firelineIntensity', type: 'firelineIntensity', init: 0, desc: ''},
    {key: 'heatPerUnitArea', type: 'heatPerUnitArea', init: 0, desc: ''},
    {key: 'rotationDeg', type: 'bearing', init: 0, desc: ''},
    {key: 'rotationRad', type: 'angle', init: 0, desc: ''},
    {key: 'rotationCos', type: 'cos', init: 0, desc: ''},
    {key: 'rotationSin', type: 'sin', init: 0, desc: ''},
    {key: 'rotationCosInv', type: 'cos', init: 0, desc: ''},
    {key: 'rotationSinInv', type: 'sin', init: 0, desc: ''},
]

export class FireShape {
    /**
     * @param {object} params An object with at least the following properties:
     * - [req] params: Reference to an object containing a 'fireBehavior' object, which must have:
     *      - headingSpreadRate=0,
     *      - lengthWidthRatio=1,
     *      - headingFromNorth=0, fire direction of maximum spread (degrees clockwise from north)
     *      - flameLength=0, flame length (ft)
     */
    constructor(params=null) {
        if (params)
            this.update(params)
        else
            this.#init()
    }
    
    #init() {
        for(let {key, init} of FireShapeProps)
            this[key] = init
    }

    update(params) {
        // Get required fireBehavior input properties
        const {headingSpreadRate=0, headingFromNorth=0, lengthWidthRatio=1, flameLength=0} = params.fireBehavior

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
        const rotationDeg = (450 - headingFromNorth) % 360   // ellipse rotation degrees counter-clockwise from x-axis
        const rotationRad = toRadians(rotationDeg)

        const rotationCos = Math.cos(rotationRad)
        const rotationSin = Math.sin(rotationRad)

        // Inverse rotation of ellipse back to normal (clockwise)
        const rotationCosInv = Math.cos(-rotationRad)
        const rotationSinInv = Math.sin(-rotationRad)

        this.headingSpreadRate = headingSpreadRate
        this.lengthWidthRatio = lengthWidthRatio
        this.flameLength = flameLength
        this.headingFromNorth = headingFromNorth
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
