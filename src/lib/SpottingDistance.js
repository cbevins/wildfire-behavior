export const SpottingDistanceProps = [
    // Initialize return values
    {key: 'firebrandHt', type: 'ft', init:0, desc: 'Set by derived class, if relevant'},
    {key: 'criticalHt', type: 'ft', init: 0, desc: ''},
    {key: 'flatDistance', type: 'ft', init:0, desc: 'Spot distance without drift'},
    {key: 'driftDistance', type: 'ft', init:0, desc: 'Drift distance, set by derived class if relevant'},
    {key: 'levelDistance', type: 'ft', init: 0, desc: 'Total spot + drift distance on level terrain'},
    {key: 'adjustedDownwindCoverHt', type: 'ft', init:0, desc: ''},
    {key: 'maxCoverHt', type: 'ft', init:0, desc: 'Maximum of critical or actual downwind cover ht'},
]

export const SpotSourceLocations = {
    midslopeWindward:   { factor: 0, label: 'Midslope, Windward' },
    valleyBottom:       { factor: 1, label: 'Valley Bottom' },
    midslopeLeeward:    { factor: 2, label: 'Midslope, Leeward' },
    ridgeTop:           { factor: 3, label: 'Ridge Top' }
}

export class SpottingDistance {
    constructor() {
        this.init()
    }
    
    init() {
        for(let {key, init} of SpottingDistanceProps) {
            this[key] = init
        }
    }

    updateLevelDistance(params) {
        const {downwindCoverHt=0, downwindOpenCanopy=0, windSpeed20ft=0} = params
        // Minimum valid cover ht used in calculation of flat terrain spotting distance
        this.criticalHt = (this.firebrandHt > 0) ? (2.2 * (this.firebrandHt**0.337) - 4.0) : 0

        // Adjust downwind canopy height based upon downwind canopy cover
        // Added in Release6 by Issues #028FAH - Downwind Canopy Open/Closed
        this.adjustedDownwindCoverHt = downwindOpenCanopy ? 0.5 * downwindCoverHt : downwindCoverHt

        // Use maximum of the critical or actual downwind cover ht
        this.maxCoverHt = Math.max(this.adjustedDownwindCoverHt, this.criticalHt)

        this.flatDistance = this.calcFlatDistance(this.firebrandHt, this.maxCoverHt, windSpeed20ft)
        this.levelDistance = this.flatDistance + this.driftDistance
        return this
    }

    /**
     * Calculates maximum spotting distance over flat terrain (ft)
     * USED BY ALL 3 METHODS: SURFACE, TREES, and PILE
     * @param {real} firebrandHt Maximum firebrand height (ft)
     * @param {real} coverHt Downwind tree/vegetation cover height (ft)
     * @param {real} windSpeed20ft Wind speed at 20 ft (ft/min)
     * @returns Maximum spotting distance over flat terrain (ft) 
     */
    calcFlatDistance(firebrandHt, coverHt, windSpeed20ft) {
        let distance = 0
        if (coverHt > 0 && firebrandHt > 0) {
            const mph = windSpeed20ft / 88
            distance = 0.000718 * mph * Math.sqrt( coverHt )
                 * (0.362 + Math.sqrt( firebrandHt / coverHt ) / 2.
                 * Math.log( firebrandHt / coverHt ) );
        }
        return distance * 5280
    }
}

export function spottingTopography(params) {
    const {
        flatDistance,       // Spotting distance over flat terrain (ft)
        location=null,      // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
        ridgeToValleyDist,  // Horizontal distance from ridge top to valley bottom (ft)
        ridgeToValleyElev,  // Vertical distance from ridge top to valley bottom (ft)
    } = params

    if (! location || ridgeToValleyElev<=0 || ridgeToValleyDist<=0 || flatDistance<=0)
        return flatDistance

    // This model uses flat and ridge-to-valley distances in miles, not ft
    const flatMiles = flatDistance / 5280
    const rvMiles = ridgeToValleyDist / 5280

    const a1 = flatMiles / rvMiles
    const b1 = ridgeToValleyElev / (10*Math.PI) / 1000
    const factor = SpotSourceLocations[location].factor * Math.PI/2
    const cosFactor = Math.cos(factor)
    let x = a1
    for (let i=0; i<6; i++) {
        x = a1 - b1 * (Math.cos(Math.PI * x - factor) - cosFactor)
    }
    return 5280 * x * rvMiles
}
