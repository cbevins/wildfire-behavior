import { SpottingDistance } from "./SpottingDistance.js"

// Calculates maximum spotting distance from a burning pile.
export class SpottingBurningPile extends SpottingDistance {
    constructor(params) {
        super(params)
    }
    
    /**
     * 
     * @param {object} params Object with the following properties
     *  downwindCoverHt=0,    // Downwind tree/vegetation cover height (ft).
     *  downwindOpenCanopy=0, // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
     *  windSpeedAt20Ft=0,    // Wind speed at 20 ft (ft/min).
     *  flameHt=0)            // Burning pile's flame height (ft)
    */
    update(params) {
        this.init()
        const {windSpeed20ft=0, flameHt=0} = params
        if (windSpeed20ft > 0 && flameHt > 0) {
            // Determine maximum firebrand height (ft)
            this.firebrandHt = 12.2 * flameHt
            this.updateLevelDistance(params)
        }
        return this
    }
}
