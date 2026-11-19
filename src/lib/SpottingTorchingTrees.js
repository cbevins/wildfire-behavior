import { SpottingDistance } from "./SpottingDistance.js"

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

export class SpottingTorchingTrees extends SpottingDistance {
    constructor(params) {
        super(params)
    }
    
    /**
     * 
     * @param {object} params Object with the following properties
     *  downwindCoverHt=0,      // Downwind tree/vegetation cover height (ft).
     *  downwindOpenCanopy=0,   // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
     *  windSpeed20ft=0,        // Wind speed at 20 ft (ft/min).
     *  torchingTrees=0,      // Number of torching trees
        treeDbh=0,            // Tree dbh (in)
        treeHt=0,             // Tree height (ft)
        treeSpecies='PSME')   // Tree species key
    */
    update(params) {
        this.init()
        const {windSpeed20ft=0, torchingTrees=0, treeDbh=0, treeHt=0, treeSpecies='PSME'} = params

        // Determine maximum firebrand height (ft)
        if (windSpeed20ft > 0 && treeDbh > 0 && torchingTrees > 0) {
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

            this.updateLevelDistance(params)
        }
        return this
    }
}
