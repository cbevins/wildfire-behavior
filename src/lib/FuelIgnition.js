/**
 * Given a FuelBed reference and fuel moisture condition, the FuelIgnition class
 * determines all the wildland fire variables that are dependent upon fuel moisture,
 * but *not* dependent upon wind or slope parameters.  These include the reaction intensity
 * and no-wind, no-slope spread rate.
 * 
 * A FuelIgnition instance may be reused for different FuelBed and moisture conditions
 * via its update() method.
 */
import { fraction } from './utils.js'

export const FuelIgnitionProps = [
    {key: 'fuelBed', type: 'object', init: null, desc: 'Reference to a FuelBed'},
    {key: 'reactionIntensity', type: 'reactionIntensity', init: 0, desc: 'Btu/ft2/min'},
    {key: 'noWindSpreadRate', type: 'spreadRate', init: 0, desc: ''},
    {key: 'heatPreIgn', type: 'fuelHeat', init: 0, desc: '', units: 'Btu/lb'},
    {key: 'heatSink', type: 'heatSink', init: 0, desc: '', units: 'Btu/ft3'},
    {key: 'heatSource', type: 'heatSource', init: 0, desc: '', units: 'Btu/ft2/min'},
    {key: 'dead', type: '', init: {}, desc: 'Dead category {moisture, heatPreIgn, waterLoad, fineFuelMoisture}'},
    {key: 'live', type: '', init: {}, desc: 'Live Category {moisture, heatPreIgn, waterLoad, fineFuelMoisture}'},
]

export class FuelIgnition {
    /**
     * @param {object} params An object with at least the following properties:
     *  - [req] fuelBed: a reference to a FuelBed as returned by new FuelBed(params) or fuelBed.update(params)
     *  The following fuel moisture contents (ratio of water weight to ovendry fuel weight) are only technically
     *  required if the fuelModel references them:
     *  - moistureDead1h: 
     *  - moistureDead10h:
     *  - moistureDead100h:
     *  - moistureLiveHerb:
     *  - moistureLiveStem:
     *  - <moistureOther>: any other fuel moisture class required by a custom fuel model (i..e., 'moistureDeadDuff')
     */
    constructor(params=null) {
        if (params)
            this.update(params)
        else
            this.#init()
    }
    #init() {
        for(let {key, init} of FuelIgnitionProps)
            this[key] = init
        return this
    }

    update(params) {
        this.#init()
        const { fuelBed } = params
        this.fuelBed = fuelBed
        
        // Update life category moisture variables
        const cat = {dead: {}, live: {}}
        for(let life of ["dead", "live"]) {
            cat[life].moisture = 0
            cat[life].heatPreIgn = 0
            cat[life].fineFuelMoisture = 0
            cat[life].fineWaterLoad = 0

            for(let particle of fuelBed[life].particles) {
                let moistureClass = particle.moistureClass
                if(! Object.hasOwn(params, moistureClass))
                    throw new Error(`makeFuelIgnition(): a fuel particle has a moisture class '${particle.moistureClass}' that is not defined in the input parameters object.`)
                const moistureContent = params[moistureClass]
                cat[life].moisture += moistureContent * particle.surfaceAreaWtg    // wtd average

                // Particle heat of pre-ignition (Btu/lb) from Rothermel Eq 12 (p 7, 26)
                const heatPreIgn = particle.effHeating * (250.0 + 1116.0 * moistureContent)
                cat[life].heatPreIgn += heatPreIgn * particle.surfaceAreaWtg      // wtd average

                // The fine fuel water load applies ONLY to the dead fuel category,
                // and is ONLY used in the computation of the fine fuel moisture content,
                // which in turn is used to derive the live fuel moisture content of extinction
                const fineWaterLoad = particle.fineFuelLoad * moistureContent
                cat[life].fineWaterLoad += fineWaterLoad
            }
            
            // Only the DEAD life category fine fuel moisture content is needed, as it is
            // ONLY used in the computation of live fuel moisture content of extinction
            cat[life].fineFuelMoisture = cat[life].fineWaterLoad / fuelBed[life].fineFuelLoad
        }

        // Fuel bed weighted heat of preignition
        const heatPreIgn = cat.dead.heatPreIgn * fuelBed.dead.surfaceAreaWtg
                        + cat.live.heatPreIgn * fuelBed.live.surfaceAreaWtg

        // Live fuel moisture content of extinction
        cat.dead.mext = fuelBed.dead.mext
        const dry = 1 - cat.dead.fineFuelMoisture / cat.dead.mext
        const liveMext = fuelBed.liveMextFactor * dry - 0.226
        cat.live.mext = Math.max(liveMext, cat.dead.mext)

        let reactionIntensity = 0
        for(let life of ["dead", "live"]) {
            // Fuel bed life category moisture damping coefficient
            let r = (cat[life].mext > 0) ? cat[life].moisture / cat[life].mext : 0
            cat[life].moistureDamping = fraction(1 - 2.59 * r + 5.11 * r * r - 3.52 * r * r * r)

            // Fuel bed life category reaction intensity under current moisture conditions (BTU/ft2/min)
            cat[life].reactionIntensity = fuelBed[life].reactionIntensityDry * cat[life].moistureDamping

            // Fuel bed reaction intensity under current moisture conditions (BTU/ft2/min)
            reactionIntensity += cat[life].reactionIntensity
        }
        
        // Fire spread heat sink (Btu/ft3)
        const heatSink = fuelBed.bulkDensity * heatPreIgn

        // Fire spread heat source (Btu/ft2/min)
        // Product of the total fire reaction intensity (Btu/ft2/min)
        // and the fuel bed propagating flux ratio (ratio).
        const heatSource = reactionIntensity * fuelBed.propagatingFluxRatio

        // No-wind, no-slope fire spread rate (ft/min)
        const noWindSpreadRate = (heatSink > 0) ? heatSource / heatSink : 0
        
        this.reactionIntensity = reactionIntensity
        this.noWindSpreadRate = noWindSpreadRate
        this.heatPreIgn = heatPreIgn
        this.heatSink = heatSink
        this.heatSource = heatSource
        this.dead = cat.dead
        this.live = cat.live
        return this
    }
}
