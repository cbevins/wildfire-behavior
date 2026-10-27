export class FireSize {
    /**
     * 
     * @param {*} fireShape 
     * @param {*} firePosition Reference to an object with the following props:
     *  {elapsedTime, ignEast, ignNorth, ignX, ignY}
     * 
     */
    constructor(fireShape, firePosition) {
        this.init()
        this.update(fireShape, firePosition)
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
    update(fireEllipse, firePosition) {
        this.init()
        // Get required inputs
        let {elapsedTime=1, ignEast=0, ignNorth=0, ignX=0, ignY=0} = firePosition

        // Distance (ft) between the *ignition point* and the fire ellipse head
        const headingDistance = fireEllipse.headingSpreadRate * elapsedTime
        
        // Distance (ft) between the *ignition point* and the fire ellipse back
        const backingDistance = fireEllipse.backingSpreadRate * elapsedTime

        // Major semi-axis length (ft) [aka 'rx']
        const fDistance = fireEllipse.fSpreadRate * elapsedTime

        // Distance (ft) between ignition and center points
        const gDistance = fireEllipse.gSpreadRate * elapsedTime

        // Minor semi-axis length (ft) [aka 'ry']
        const hDistance = fireEllipse.hSpreadRate * elapsedTime

        // Latus rectum semi-chord length (ft)
        const latusRectumDistance = fireEllipse.latusRectumSpreadRate * elapsedTime

        // Total ellipse length (ft)
        const length = fireEllipse.majorExpansionRate * elapsedTime

        // Total ellipse width (ft)
        const width = fireEllipse.minorExpansionRate * elapsedTime
        
        // Ellipse area (ft2)
        const area = (Math.PI * length * width) / 4
        const acres = area / (66*660)

        // Ellipse perimeter length (ft) using Ramanujan's approximation.
        const a = fDistance, b = hDistance
        const h = (a - b)**2 / (a + b)**2
        const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))

        // Since getBetaFireVector() cannot be used to determine the center point position,
        // we have to do it hgere manually
        const centerX = ignX + gDistance * fireEllipse.rotationCos
        const centerY = ignY + gDistance * fireEllipse.rotationSin
        const centerE = centerX + ignEast - ignX
        const centerN = centerY + ignNorth - ignY

        this.headingSpreadRate = fireEllipse.headingSpreadRate
        this.lengthWidthRatio = fireEllipse.lengthWidthRatio
        this.flameLength = fireEllipse.flameLength
        this.bearing = fireEllipse.bearing
        this.eccentricity = fireEllipse.eccentricity
        this.backingSpreadRate = fireEllipse.backingSpreadRate
        this.majorExpansionRate = fireEllipse.majorExpansionRate
        this.minorExpansionRate = fireEllipse.minorExpansionRate
        this.fSpreadRate = fireEllipse.fSpreadRate
        this.hSpreadRate = fireEllipse.hSpreadRate
        this.gSpreadRate = fireEllipse.gSpreadRate
        this.latusRectumSpreadRate = fireEllipse.latusRectumSpreadRate
        this.effectiveWindSpeed = fireEllipse.effectiveWindSpeed
        this.firelineIntensity = fireEllipse.firelineIntensity
        this.heatPerUnitArea = fireEllipse.heatPerUnitArea
        this.rotationDeg = fireEllipse.rotationDeg
        this.rotationRad = fireEllipse.rotationRad
        this.rotationCos = fireEllipse.rotationCos
        this.rotationSin = fireEllipse.rotationSin
        this.rotationCosInv = fireEllipse.rotationCosInv
        this.rotationSinInv = fireEllipse.rotationSinInv

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
