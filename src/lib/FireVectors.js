import { clockwiseFromHeadToBearing, clockwiseFromHeadToRotation,
    getFlameLength, getScorchHeight, toRadians } from './utils.js'
import { calcBetaFromTheta, calcPsiFromTheta, calcThetaFromBeta } from './calcEllipseAngles.js'

export const FireVectorProps = [
    { key: 'angleFromHead', type: 'angle', init: 0, desc: ''},
    { key: 'bearing', type: 'bearing', init: 0, desc: ''},
    { key: 'ratio', type: 'ratio', init: 1, desc: ''},
    { key: 'spreadRate', type: 'spreadRate', init: 0, desc: ''},
    { key: 'distance', type: 'fireDistance', init: 0, desc: ''},
    { key: 'firelineIntensity', type: 'firelineIntensity', init: 0, desc: ''},
    { key: 'flameLength', type: 'flameLength', init: 0, desc: ''},
    { key: 'x', type: 'easting', init: 0, desc: ''},
    { key: 'y', type: 'northing', init: 0, desc: ''},
    { key: 'east', type: 'easting', init: 0, desc: ''},
    { key: 'north', type: 'northing', init: 0, desc: ''},
    { key: 'scorchHeight', type: 'scorchHeight', init: 0, desc: ''},
    // FireVectorBeta6 also adds: theta, psi, psiRos 
]

export class FireVector {
    constructor(params=null) {
        if (!params) this.init()
    }

    init() {
        for(let {key, init} of FireVectorProps)
            this[key] = init
        return this
    }

    /**
     * 
     * @param {object} params Object with following properties:
     * - [opt] airTemp=77, air temperature (F)
     * - [opt] midflameWindSpeed=0, wind speed at midflame height (ft/min)
     * @returns 
     */
    getScorchHeight(params) {
        const {airTemp=77, midflameWindSpeed=0} = params
        this.scorchHeight = getScorchHeight(this.firelineIntensity, airTemp, midflameWindSpeed)
        return this.scorchHeight
    }
}

//------------------------------------------------------------------------------
// FireVectorBeta()
// 'Beta' fire vectors are anchored at the FireEllipse ignition point
// at [ignX, ignY] in the local coordinate system,
// or at [ignEast, ignNorth] projected coordinate system.
//------------------------------------------------------------------------------
export class FireVectorBeta extends FireVector {
    /**
     * @param {object} params Object with following properties:
     * - [req] fireSize: Reference an object returned by new FireSize(params) or fireSize.update(params)
     *          or has following properties:
     *              {bearing, eccentricity, headingSpreadRate, firelineIntensity, rotationDeg,
     *              elapsedTime, ignX, ignY, ignEast, ignNorth}
     * - [opt] betaFromHead=0, fire vector angle in degrees clockwise from fire head
     */
    constructor(params=null) {
        super(params)
        if(params) this.update(params)
    }

    update(params) {
        this.init()
        
        // Get required fireSize (and fireShape) input properties
        const {fireSize, betaFromHead=0, calcVectorFlameLength=true} = params
        const {headingFromNorth, eccentricity:e, headingSpreadRate, firelineIntensity, rotationDeg,
            elapsedTime, ignX, ignY, ignEast, ignNorth,} = fireSize

        // betaRotation is the *counter-clockwise* rotation from fire heading
        const betaRotation = clockwiseFromHeadToRotation(betaFromHead)
        const betaRadians = toRadians(betaRotation + rotationDeg)

        this.angleFromHead = betaFromHead
        this.bearing = clockwiseFromHeadToBearing(betaFromHead, headingFromNorth)

        this.ratio = (1 - e) / (1 - e * Math.cos(toRadians(betaRotation)))
        this.spreadRate = this.ratio * headingSpreadRate
        this.distance = this.spreadRate * elapsedTime
        this.firelineIntensity = this.ratio * firelineIntensity

        // Perimeter position requires 2 more trancendentals
        this.x = ignX + this.distance * Math.cos(betaRadians)
        this.y = ignY + this.distance * Math.sin(betaRadians)
        this.east = this.x + ignEast - ignX
        this.north = this.y + ignNorth - ignY

        if (calcVectorFlameLength)
            this.flameLength = getFlameLength(this.firelineIntensity)
        return this
    }
}

//------------------------------------------------------------------------------
// FireVectorBeta6() uses Psi angle's fireline intensity
//------------------------------------------------------------------------------

export class FireVectorBeta6 extends FireVectorBeta {
    constructor(params=null) {
        super(params)
    }

    update(params) {
        super.update(params)
        const {fireSize, betaFromHead=0, calcVectorFlameLength=true} = params

       // betaRotation is the *counter-clockwise* rotation from fire heading
        const betaRotation = clockwiseFromHeadToRotation(betaFromHead)

        // Adjust fireline intensity to use psi distance
        this.theta = calcThetaFromBeta(fireSize, betaRotation)
        this.psi = calcPsiFromTheta(fireSize, this.theta)
        this.psiRos = calcPsiSpreadRate(fireSize, this.psi)
        this.firelineIntensity = fireSize.firelineIntensity * this.psiRos / fireSize.headingSpreadRate

        if (calcVectorFlameLength)
            this.flameLength = getFlameLength(this.firelineIntensity)
        return this
    }
}

// Returns a FireVectorBeta where the angle from the ignition point intersects the left flank
export class FireVectorBetaAtLeftFlank extends FireVectorBeta {
    constructor(params=null) {
        super(params)
    }
    
    update(params) {
        const {fireSize} = params
        const betaFromHead = calcBetaFromTheta(fireSize, 270)
        return super.update({...params, betaFromHead})
    }
}

// Returns a FireVectorBeta where the angle from the ignition point intersects the right flank
export class FireVectorBetaAtRightFlank extends FireVectorBeta {
    constructor(params=null) {
        super(params)
    }
    
    update(params) {
        const {fireSize} = params
        const betaFromHead = calcBetaFromTheta(fireSize, 90)
        return super.update({...params, betaFromHead})
    }
}

export class FireVectorPsi extends FireVector {
    constructor(params=null) {
        super(params)
        if(params) this.update(params)
    }

    update(params) {
        this.init()
        
        // Get required fireSize (and fireShape) input properties
        const {fireSize, psiFromHead=0, calcVectorFlameLength=true} = params

        // Get required fireEllipse/fireSize/firePosition input properties from fireSize
        const {headingFromNorth, headingSpreadRate, firelineIntensity, rotationDeg,
            ignX, ignY, ignEast, ignNorth} = fireSize

        // psiRotation is the *counter-clockwise* rotation from fire heading
        const psiRotation = clockwiseFromHeadToRotation(psiFromHead)
        const psiRadians = toRadians(psiRotation + rotationDeg)

        this.angleFromHead = psiFromHead
        this.bearing = clockwiseFromHeadToBearing(psiFromHead, headingFromNorth)

        this.spreadRate = calcPsiSpreadRate(fireSize, psiRotation)
        this.distance = this.spreadRate * fireSize.elapsedTime
        this.ratio = (headingSpreadRate > 0) ? this.spreadRate / headingSpreadRate : 0
        this.firelineIntensity = this.ratio * firelineIntensity

        this.x = ignX + this.distance * Math.cos(psiRadians)
        this.y = ignY + this.distance * Math.sin(psiRadians)
        this.east = this.x + ignEast - ignX
        this.north = this.y + ignNorth - ignY

        if (calcVectorFlameLength)
            this.flameLength = getFlameLength(this.firelineIntensity)
        return this
    }
}

export class FireVectorBack extends FireVectorBeta {
    constructor(params=null) {
        super(params)
    }
    
    update(params) {
        return super.update({...params, betaFromHead: 180})
    }
}

export class FireVectorHead extends FireVectorBeta {
    constructor(params=null) {
        super(params)
    }
    
    update(params) {
        return super.update({...params, betaFromHead: 0})
    }
}

// Returns spread rate from the ellipse *perimeter* (or 'fire front')
// at 'psiDegrees' *counter-clockwise* rotation from the heading direction
// Catchpole et.al. (1982) Equation 7
export function calcPsiSpreadRate(fireEllipse, psiDegrees) {
    const f = fireEllipse.fSpreadRate
    const g = fireEllipse.gSpreadRate
    const h = fireEllipse.hSpreadRate
    if (f <=0 || h <=0 || g <= 0) return 0
    const psi = toRadians(psiDegrees)
    const cosPsi = Math.cos(psi)
    const cos2Psi = cosPsi * cosPsi
    const sin2Psi = 1 - cos2Psi
    const ros = g * cosPsi + Math.sqrt((f * f * cos2Psi) + (h * h * sin2Psi))
    return ros
}
