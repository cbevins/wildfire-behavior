export const SpotSourceLocations = {
    midslopeWindward:   { factor: 0, label: 'Midslope, Windward' },
    valleyBottom:       { factor: 1, label: 'Valley Bottom' },
    midslopeLeeward:    { factor: 2, label: 'Midslope, Leeward' },
    ridgeTop:           { factor: 3, label: 'Ridge Top' }
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

// Calculates maximum spotting distance from a burning pile.
export class SpotDistanceFromBurningPile extends SpotDistance {
    constructor() {
        super()
    }
    update(
        downwindCoverHt=0,    // Downwind tree/vegetation cover height (ft).
        downwindOpenCanopy=0, // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
        windSpeedAt20Ft=0,    // Wind speed at 20 ft (ft/min).
        flameHt=0)            // Burning pile's flame height (ft)
    {
        this.init(downwindCoverHt, downwindOpenCanopy, windSpeedAt20Ft)
        this.flameHt = flameHt
        if (windSpeedAt20Ft > 0 && flameHt > 0) {
            // Determine maximum firebrand height (ft)
            this.firebrandHt = 12.2 * this.flameHt
            this.updateLevelDistance()
        }
        return this
    }
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

// Calculates maximum spotting distance from a group of torching trees.
export const TorchA = {
    ABBA: { common: 'balsam fir', scientific: 'Abies balsamea',
        height: [16.5, 0.515], duration: [10.7, -0.278]},
    ABGR: {common: 'grand fir', scientific: 'Abies grandis',
        height: [16.5, 0.515], duration: [10.7, -0.278]},
    ABLA: {common: 'subalpine fir', scientific: 'Abies lasiocarpa',
        height: [15.7, 0.451], duration: [10.7, -0.278]},
    PICO: {common: 'lodgepole pine', scientific: 'Pinus contorta',
        height: [12.9, 0.453], duration: [12.6, -0.256]},
    PIEC2: {common: 'shortleaf pine', scientific: 'Pinus echinata',
        height: [2.71, 1.0], duration: [7.91, -0.344]},
    PIEL: {common: 'slash pine', scientific: 'Pinus elliottii',
        height: [2.71, 1.0], duration: [11.9, -0.389]},
    PIEN: {common: 'Engelmann spruce', scientific: 'Picea engelmannii',
        height: [15.7, 0.451], duration: [12.6, -0.256]},
    PIMO3: {common: 'western white pine', scientific: 'Pinus monticola',
        height: [12.9, 0.453], duration: [10.7, -0.278]},
    PIPA2: {common: 'longleaf pine', scientific: 'Pinus palustrus',
        height: [2.71, 1.0], duration: [11.9, -0.389]},
    PIPO: {common: 'ponderosa pine', scientific: 'Pinus ponderosa',
        height: [12.9, 0.453], duration: [12.6, -0.256]},
    PISE: {common: 'pond pine', scientific: 'Pinus serotina',
        height: [2.71, 1.0], duration: [7.91, -0.344]},
    PITA: {common: 'loblolly pine', scientific: 'Pinus taeda',
        height: [2.71, 1.0], duration: [13.5, -0.544]},
    PSME: {common: 'Douglas-fir', scientific: 'Pseudotsuga menziesii',
        height: [15.7, 0.451], duration: [10.7, -0.278]},
    TSHE: {common: 'western hemlock', scientific: 'Tsuga heterophylla',
        height: [15.7, 0.451], duration: [6.3, -0.249]},
    // This is an estimated guess,
    // using the height parms used by PICO, PIPO, and PIMO3
    // and the duration parms used by TSHE
    LAOC: {common: 'western larch', scientific: '"Larix occidentalis (guess)',
        height: [12.9, 0.453], duration: [6.3, -0.249]},
    // This is an estimated guess,
    // using the height parms used by ABLA, PIEN, PSME, and TSHE
    // and the duration parms used by PICO, PIEN, and PIPO
    THPL: {scientific: 'Thuja plicata', common: 'western red cedar (guess)',
        height: [15.7, 0.451], duration: [12.6, -0.256]}
}

const TorchB = [
    [4.24, 0.332],
    [3.64, 0.391],
    [2.78, 0.418],
    [4.70, 0.000]
]

export class SpotDistanceFromTorchingTrees extends SpotDistance {
    constructor() {
        super()
    }
    update(
        downwindCoverHt=0,    // Downwind tree/vegetation cover height (ft).
        downwindOpenCanopy=0, // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
        windSpeedAt20Ft=0,    // Wind speed at 20 ft (ft/min).
        torchingTrees=0,      // Number of torching trees
        treeDbh=0,            // Tree dbh (in)
        treeHt=0,             // Tree height (ft)
        treeSpecies='PSME')   // Tree species key
    {
        this.init(downwindCoverHt, downwindOpenCanopy, windSpeedAt20Ft)
        this.torchingTrees = torchingTrees
        this.treeDbh = treeDbh
        this.treeHt = treeHt
        this.treeSpecies = treeSpecies

        // Determine maximum firebrand height (ft)
        if (windSpeedAt20Ft > 0 && treeDbh > 0 && torchingTrees > 0) {
            // Catch species errors.
            if (! Object.hasOwn(TorchA, treeSpecies))
                throw new Error(`SpotDistanceFromTorchingTrees.update() passed invalid tree species code '${treeSpecies}'.`)

            // Steady flame duration (min)
            const {height, duration} = TorchA[treeSpecies]
            const [durA, durB] = duration
            this.flameDur = durA * treeDbh**durB * torchingTrees**-0.2

            // Steady flame height (ft)
            const [htA, htB] = height
            this.flameHt = htA * treeDbh**htB * torchingTrees**0.4
            this.flameRatio = (this.flameHt > 0) ? treeHt / this.flameHt : 0
            
            // Firebrand height depends on flame ratio and duration class
            let j = 3
            if (this.flameRatio >= 1) j = 0
            else if (this.flameRatio >= 0.5) j = 1
            else if (this.flameDur < 3.5) j = 2

            // Initial firebrand height (ft).
            this.firebrandHt = TorchB[j][0] * Math.pow(this.flameDur, TorchB[j][1])
                * this.flameHt + treeHt/2

            this.updateLevelDistance()
        }
        return this
    }
}
