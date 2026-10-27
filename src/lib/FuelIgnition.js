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

export class FuelIgnition {
    /**
     * 
     * @param {FuelBed} fuelBedRef Reference to an object created by new FuelBed()
     * @param {object} fuelMoistureObj Reference to an object like {moistureDead1h, moistureDead10h, moistureDead100h,
     * moistureLiveHerb, moistureLiveStem}}
     */
    constructor(fuelBedRef, fuelMoistureObj) {
        this.init()
        this.update(fuelBedRef, fuelMoistureObj)
    }

    init() {
        this.fuelBed = null
        this.reactionIntensity = 0
        this.noWindSpreadRate = 0
        this.heatPreIgn = 0
        this.heatSink = 0
        this.heatSource = 0
        this.dead = {}
        this.live = {}
    }

    update(fuelBedRef, fuelMoistureObj) {
        this.fuelBed = fuelBedRef
        
        // Update life category moisture variables
        const cat = {dead: {}, live: {}}
        for(let life of ["dead", "live"]) {
            cat[life].moisture = 0
            cat[life].heatPreIgn = 0
            cat[life].fineFuelMoisture = 0
            cat[life].fineWaterLoad = 0

            for(let particle of fuelBedRef[life].particles) {
                let moistureClass = particle.moistureClass
                if(! Object.hasOwn(fuelMoistureObj, moistureClass))
                    throw new Error(`makeFuelIgnition(): a fuel particle has a moisture class '${particle.moistureClass}' that is not defined in the fuelMoistureObj input object.`)
                const moistureContent = fuelMoistureObj[moistureClass]
                cat[life].moisture += moistureContent * particle.surfaceAreaWtg    // wtd average

                // Particle heat of pre-ignition (BTU/lb) from Rothermel Eq 12 (p 7, 26)
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
            cat[life].fineFuelMoisture = cat[life].fineWaterLoad / fuelBedRef[life].fineFuelLoad
        }

        // Fuel bed weighted heat of preignition
        const heatPreIgn = cat.dead.heatPreIgn * fuelBedRef.dead.surfaceAreaWtg
                        + cat.live.heatPreIgn * fuelBedRef.live.surfaceAreaWtg

        // Live fuel moisture content of extinction
        cat.dead.mext = fuelBedRef.dead.mext
        const dry = 1 - cat.dead.fineFuelMoisture / cat.dead.mext
        const liveMext = fuelBedRef.liveMextFactor * dry - 0.226
        cat.live.mext = Math.max(liveMext, cat.dead.mext)

        let reactionIntensity = 0
        for(let life of ["dead", "live"]) {
            // Fuel bed life category moisture damping coefficient
            let r = (cat[life].mext > 0) ? cat[life].moisture / cat[life].mext : 0
            cat[life].moistureDamping = fraction(1 - 2.59 * r + 5.11 * r * r - 3.52 * r * r * r)

            // Fuel bed life category reaction intensity under current moisture conditions (BTU/ft2/min)
            cat[life].reactionIntensity = fuelBedRef[life].reactionIntensityDry * cat[life].moistureDamping

            // Fuel bed reaction intensity under current moisture conditions (BTU/ft2/min)
            reactionIntensity += cat[life].reactionIntensity
        }
        
        // Fire spread heat sink (BTU/ft3)
        const heatSink = fuelBedRef.bulkDensity * heatPreIgn

        // Fire spread heat source (BTU/ft2/min)
        // Product of the total fire reaction intensity (btu+1 ft-2 min-1)
        // and the fuel bed propagating flux ratio (ratio).
        const heatSource = reactionIntensity * fuelBedRef.propagatingFluxRatio

        // No-wind, no-slope fire spread rate
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
