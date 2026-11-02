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

        this.headingDistance = 0
        this.backingDistance = 0
        this.elapsedTime = 0
        this.fDistance = 0
        this.gDistance = 0
        this.hDistance = 0
        this.latusRectumDistance = 0
        this.length = 0
        this.width = 0
        this.area = 0
        this.acres = 0
        this.perimeter = 0
        this.ignEast = 0
        this.ignNorth = 0
        this.ignX = 0
        this.ignY = 0
        this.centerX = 0
        this.centerY = 0
        this.centerE = 0
        this.centerN = 0
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
        this.bearing = fireShape.bearing
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
