export const SpotSourceLocations = {
    midslopeWindward:   { factor: 0, label: 'Midslope, Windward' },
    valleyBottom:       { factor: 1, label: 'Valley Bottom' },
    midslopeLeeward:    { factor: 2, label: 'Midslope, Leeward' },
    ridgeTop:           { factor: 3, label: 'Ridge Top' }
}

// Calculates maximum spotting distance from a surface fire.
export class SpotDistanceFromSurfaceFire extends SpotDistance {
    constructor() {
        super()
    }
    update(
        downwindCoverHt=0,    // Downwind tree/vegetation cover height (ft).
        downwindOpenCanopy=0, // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
        windSpeedAt20Ft=0,    // Wind speed at 20 ft (ft/min).
        flameLength=0)        // Surface fire flame length (ft)
    {
        this.init(downwindCoverHt, downwindOpenCanopy, windSpeedAt20Ft)
        this.flameLength = flameLength
        
        // Determine maximum firebrand height (ft)
        if (this.windSpeedAt20Ft > 0 && this.flameLength > 0) {
            const mph = windSpeedAt20Ft / 88

            // f is function relating thermal energy to windspeed.
            const f = 322 * (0.474 * mph)**-1.01

            // Byram's fireline intensity is derived back from flame length.
            const byrams = (this.flameLength/0.45)**(1/0.46)

            // Initial firebrand height (ft).
            this.firebrandHt = ((f * byrams) > 0) ? (1.055 * Math.sqrt(f * byrams)) : 0

            if (this.firebrandHt > 0)
                this.driftDistance = 5280 * (0.000278 * mph * this.firebrandHt**0.643)

            this.updateLevelDistance()
        }
        return this
    }
}

export class SpotDistance {
    constructor() {
        this.init()
    }

    init(downwindCoverHt=0, downwindOpenCanopy=0, windSpeedAt20Ft=0) {
        // Store inputs
        this.downwindCoverHt = downwindCoverHt
        this.downwindOpenCanopy = downwindOpenCanopy
        this.windSpeedAt20Ft = windSpeedAt20Ft
        // Initialize return values
        this.firebrandHt = 0
        this.criticalHt  = 0
        this.flatDistance = 0
        this.driftDistance = 0
        this.levelDistance  = 0
        this.adjustedDownwindCoverHt = downwindCoverHt
        this.coverHt = 0

        this.location = 'NONE'
        this.ridgeToValleyDist = 0
        this.ridgeToValleyElev = 0
        this.terrainDistance = 0
    }
    
    updateLevelDistance() {
        // Minimum valid cover ht used in calculation of flat terrain spotting distance
        this.criticalHt = (this.firebrandHt > 0) ? (2.2 * this.firebrandHt**0.337 - 4.0) : 0

        // Adjust downwind canopy height based upon downwind canopy cover
        // Added in Release6 by Issues #028FAH - Downwind Canopy Open/Closed
        this.adjustedDownwindCoverHt = this.downwindOpenCanopy ? 0.5*this.downwindCoverHt : this.downwindCoverHt

        // Use maximum of the critical or actual downwind cover ht
        this.coverHt = Math.max(this.adjustedDownwindCoverHt, this.criticalHt)

        this.flatDistance = this.getSpotDistanceFlatTerrain(
            this.firebrandHt, this.coverHt, this.windSpeedAt20Ft)

        this.levelDistance = this.flatDistance + this.driftDistance
    }

    /**
     * Calculates maximum spotting distance over flat terrain (ft)
     * USED BY ALL 3 METHODS: SURFACE, TREES, and PILE
     * @param {real} firebrandHt Maximum firebrand height (ft)
     * @param {real} coverHt Downwind tree/vegetation cover height (ft)
     * @param {real} windSpeedAt20Ft Wind speed at 20 ft (ft/min)
     * @returns Maximum spotting distance over flat terrain (ft) 
     */
    getSpotDistanceFlatTerrain(firebrandHt, coverHt, windSpeedAt20Ft) {
        let distance = 0
        // This model uses wind speed in mi/h, not in ft/min
        const mph = windSpeedAt20Ft / 88
        if (coverHt > 0 && firebrandHt > 0) {
            const ratio = firebrandHt/coverHt
            distance = 0.000718 * mph * Math.sqrt(coverHt)
                * ((0.362 + Math.sqrt(ratio) / 2) * Math.log(ratio))
        }
        return distance * 5280
    }

    updateTerrainDistance(
        location,           // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
        ridgeToValleyDist,  // Horizontal distance from ridge top to valley bottom (ft)
        ridgeToValleyElev)  // Vertical distance from ridge top to valley bottom (ft)
    {
        this.location = location
        this.ridgeToValleyDist = ridgeToValleyDist
        this.ridgeToValleyElev = ridgeToValleyElev
        this.terrainDistance = getSpotDistanceMountainTerrain(
            this.levelDistance, location, ridgeToValleyDist, ridgeToValleyElev)
    }
}

// Calculates maximum spotting distance over mountainous terrain (ft)
export function getSpotDistanceMountainTerrain(
        flatDistance,       // Maximum spotting distance over flat terrain (ft)
        location,           // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
        ridgeToValleyDist,  // Horizontal distance from ridge top to valley bottom (ft)
        ridgeToValleyElev)  // Vertical distance from ridge top to valley bottom (ft)
{
    if (!Object.hasOwn(SpotSourceLocations, location))
        throw new Error(`getSpotDistanceMountainTerrain() passed invalid location key '${location}'.`)

    // This model uses flat and ridge-to-valley distances in miles, not ft
    const flatMiles = flatDistance / 5280
    const rvMiles = ridgeToValleyDist / 5280

    let spotMiles = flatMiles
    if (ridgeToValleyElev > 0 && ridgeToValleyDist > 0) {
        const a1 = flatMiles / rvMiles
        const b1 = ridgeToValleyElev / (10*Math.PI) / 1000
        const factor = SpotSourceLocations[location].factor
        let x = a1
        for (let i=0; i<6; i++) {
            x = a1 - b1 * (Math.cos(Math.PI * x - factor * Math.PI/2)
            - Math.cos(factor * Math.PI/2))
        }
        spotMiles = x * rvMiles
    }
    return spotMiles * 5280
}
