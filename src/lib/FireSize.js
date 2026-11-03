export const FireSizeProps = [
    {key: 'headingSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'headingFromNorth', type: 'bearing', init: 0, desc: ''},
    {key: 'flameLength', type: 'flameLength', init: 0, desc: ''},
    {key: 'lengthWidthRatio', type: 'lengthWidthRatio', init: 1, desc: ''},
    {key: 'eccentricity', type: 'eccentricity', init: 0, desc: ''},
    {key: 'backingSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'majorExpansionRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'minorExpansionRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'fSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'hSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'gSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'latusRectumSpreadRate', type: '', init: 0, desc: ''},
    {key: 'effectiveWindSpeed', type: '', init: 0, desc: ''},
    {key: 'firelineIntensity', type: 'firelineIntensity', init: 0, desc: ''},
    {key: 'heatPerUnitArea', type: 'heatPerUnitArea', init: 0, desc: ''},
    {key: 'rotationDeg', type: 'bearing', init: 0, desc: 'Ellipse rotation degrees counter-clockwise from x-axis'},
    {key: 'rotationRad', type: 'angle', init: 0, desc: ''},
    {key: 'rotationCos', type: 'cos', init: 0, desc: ''},
    {key: 'rotationSin', type: 'sin', init: 0, desc: ''},
    {key: 'rotationCosInv', type: 'cos', init: 0, desc: ''},
    {key: 'rotationSinInv', type: 'sin', init: 0, desc: ''},
    {key: 'headingDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'backingDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'elapsedTime', type: 'fireTime', init: 0, desc: ''},
    {key: 'fDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'gDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'hDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'latusRectumDistance', type: 'fireDistance', init: 0, desc: ''},
    {key: 'length', type: 'fireDistance', init: 0, desc: ''},
    {key: 'width', type: 'fireDistance', init: 0, desc: ''},
    {key: 'area', type: 'fireSize', init: 0, units: 'ft2', desc: ''},
    {key: 'acres', type: 'fireSize', init: 0, units: 'ac', desc: ''},
    {key: 'perimeter', type: 'fireDistance', init: 0, desc: ''},
    {key: 'ignEast', type: 'easting', init: 0, desc: ''},
    {key: 'ignNorth', type: 'northing', init: 0, desc: ''},
    {key: 'ignX', type: 'easting', init: 0, desc: ''},
    {key: 'ignY', type: 'northing', init: 0, desc: ''},
    {key: 'centerX', type: 'easting', init: 0, desc: ''},
    {key: 'centerY', type: 'northing', init: 0, desc: ''},
    {key: 'centerE', type: 'easting', init: 0, desc: ''},
    {key: 'centerN', type: 'northing', init: 0, desc: ''},
]

export class FireSize {
    /**
     * @param {object} params An object with at least the following properties:
     * - [req] fireShape: Reference to an object created by new FireShape(params) or fireShape.update(params)
     *      or having ALL its properties
     * - [opt] elapsedTime=0, elapsed time since ignition (min),
     * - [opt] ignEast=0, ignition point easting in the projected coordinate system
     * - [opt] ignNorth=0, ignition point northing in the projected coordinate system
     * - [opt] ignX=0, ignition point x coordinate in fire ellipse's local coordinate system (no need to change this)
     * - [opt] ignY=0, ignition point y coordinate in fire ellipse's local coordinate system (no need to change this)
     */
    constructor(params=null) {
        if (params)
            this.update(params)
        else
            this.#init()
    }
    
    #init() {
        for(let {key, init} of FireSizeProps)
            this[key] = init
    }

    update(params) {
        this.#init()
        // Get required inputs
        let {fireShape, elapsedTime=1, ignEast=0, ignNorth=0, ignX=0, ignY=0} = params

        // Distance (ft) between the *ignition point* and the fire ellipse head
        const headingDistance = fireShape.headingSpreadRate * elapsedTime
        
        // Distance (ft) between the *ignition point* and the fire ellipse back
        const backingDistance = fireShape.backingSpreadRate * elapsedTime

        // Major semi-axis length (ft) [aka 'rx']
        const fDistance = fireShape.fSpreadRate * elapsedTime

        // Distance (ft) between ignition and center points
        const gDistance = fireShape.gSpreadRate * elapsedTime

        // Minor semi-axis length (ft) [aka 'ry']
        const hDistance = fireShape.hSpreadRate * elapsedTime

        // Latus rectum semi-chord length (ft)
        const latusRectumDistance = fireShape.latusRectumSpreadRate * elapsedTime

        // Total ellipse length (ft)
        const length = fireShape.majorExpansionRate * elapsedTime

        // Total ellipse width (ft)
        const width = fireShape.minorExpansionRate * elapsedTime
        
        // Ellipse area (ft2)
        const area = (Math.PI * length * width) / 4
        const acres = area / (66*660)

        // Ellipse perimeter length (ft) using Ramanujan's approximation.
        const a = fDistance, b = hDistance
        const h = (a - b)**2 / (a + b)**2
        const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))

        // Since getBetaFireVector() cannot be used to determine the center point position,
        // we have to do it hgere manually
        const centerX = ignX + gDistance * fireShape.rotationCos
        const centerY = ignY + gDistance * fireShape.rotationSin
        const centerE = centerX + ignEast - ignX
        const centerN = centerY + ignNorth - ignY

        // New properties added by *this* FireSize
        this.headingSpreadRate = fireShape.headingSpreadRate
        this.lengthWidthRatio = fireShape.lengthWidthRatio
        this.flameLength = fireShape.flameLength
        this.headingFromNorth = fireShape.headingFromNorth
        this.eccentricity = fireShape.eccentricity
        this.backingSpreadRate = fireShape.backingSpreadRate
        this.majorExpansionRate = fireShape.majorExpansionRate
        this.minorExpansionRate = fireShape.minorExpansionRate
        this.fSpreadRate = fireShape.fSpreadRate
        this.hSpreadRate = fireShape.hSpreadRate
        this.gSpreadRate = fireShape.gSpreadRate
        this.latusRectumSpreadRate = fireShape.latusRectumSpreadRate
        this.effectiveWindSpeed = fireShape.effectiveWindSpeed
        this.firelineIntensity = fireShape.firelineIntensity
        this.heatPerUnitArea = fireShape.heatPerUnitArea
        this.rotationDeg = fireShape.rotationDeg
        this.rotationRad = fireShape.rotationRad
        this.rotationCos = fireShape.rotationCos
        this.rotationSin = fireShape.rotationSin
        this.rotationCosInv = fireShape.rotationCosInv
        this.rotationSinInv = fireShape.rotationSinInv

        // Clone properties from the source FireShape
        this.headingDistance = headingDistance
        this.backingDistance = backingDistance
        this.elapsedTime = elapsedTime
        this.fDistance = fDistance
        this.gDistance = gDistance
        this.hDistance = hDistance
        this.latusRectumDistance = latusRectumDistance
        this.length = length
        this.width = width
        this.area = area
        this.acres = acres
        this.perimeter = perimeter
        this.ignEast = ignEast
        this.ignNorth = ignNorth
        this.ignX = ignX
        this.ignY = ignY
        this.centerX = centerX
        this.centerY = centerY
        this.centerE = centerE
        this.centerN = centerN
        return this
    }
}
