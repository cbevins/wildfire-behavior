import { SpottingDistance } from "./SpottingDistance.js"

// Calculates maximum spotting distance from a surface fire.
export class SpottingSurfaceFire extends SpottingDistance {
    constructor(params) {
        super(params)
        this.update(params)
    }

    /**
     * 
     * @param {object} params Object with the following properties
     *  downwindCoverHt=0,      // Downwind tree/vegetation cover height (ft).
     *  downwindOpenCanopy=0,   // TRUE if downwind canopy is open, FALSE if downwind canopy is closed
     *  windSpeed20ft=0,        // Wind speed at 20 ft (ft/min).
     *  flameLength=0           // Surface fire flame length (ft)
    */
    update(params) {
        this.init()
        const {windSpeed20ft=0, flameLength=0} = params

        // Determine maximum firebrand height (ft)
        if (windSpeed20ft > 0 && flameLength > 0) {
            const mph = windSpeed20ft / 88

            // f is function relating thermal energy to windspeed
            const f = 322 * (0.474 * mph)**-1.01

            // Byram's fireline intensity is derived back from flame length
            const byrams = (flameLength / 0.45)**(1 / 0.46)

            // Initial firebrand height (ft)
            this.firebrandHt = ((f * byrams) > 0) ? (1.055 * Math.sqrt(f * byrams)) : 0

            if (this.firebrandHt > 0)
                this.driftDistance = 5280 * (0.000278 * mph * this.firebrandHt**0.643)

            this.updateLevelDistance(params)
        }
        return this
    }
}
