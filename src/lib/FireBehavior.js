/**
 * Given a FuelBed and FuelIgnition reference and wind-slope parameters, the FireBehavior class
 * determines the fire spread rate, bearing, fireline intensity, and length-to-width ratio.
 * A FireBehavior instance may be reused for different FuelBed, FuelIgnition, or wind-slope
 * parameters via its update() method.
 */
import { getScorchHeight } from './utils.js'

export class FireBehavior {
    /**
     * @param {FuelIgnition} fuelIgnition Reference to an object created by new FuelIgnition() or has the following props:
     * {fuelBed, noWindSpreadRate, reactionIntensity} 
     * @param {object} windSlopeObj Reference to an object with the following properties and defaults:
     * {midflameWindSpeed=0, windBearing=0, slopeRatio=0, aspect=180}
     * @param {object} optionsObj Reference to an object with the following properties and defaults:
     * {limitWindSpeedFactor=true, limitSpreadRateToWindSpeed=true}
     */
    constructor(fuelIgnition, windSlopeObj, optionsObj={limitWindSpeedFactor:true, limitSpreadRateToWindSpeed:true}) {
        this.init()
        this.update(fuelIgnition, windSlopeObj, optionsObj)
    }
    init() {
        // Save whatever is needed for use further downstream
        this.headingSpreadRate = 0
        this.effWindFactor = 0
        this.effWindSpeed = 0
        this.headingFromUpslope = 0
        this.bearing = 0
        this.heatPerUnitArea = 0
        this.firelineIntensity = 0
        this.flameLength = 0
        this.lengthWidthRatio = 1
        this.midflameWindSpeed = 0
        // following are used by WeightedFireBehavior()
        this.reactionIntensity = 0
        this.effWindLimitExceeded = false
        this.effWindSpeedLimit = 0
        this.residenceTime = 0
        this.spreadRateLimit = 0
        this.slopeFactor = 0
        this.upslopeFromNorth = 0
        this.windFactor = 0
        this.windHeadingFromUpslope = 0
        this.noWindNoSlopeSpreadRate = 0
        this.additionalWindSlopeSpreadRate = 0
        this.xComponent = 0
        this.yComponent = 0
        this.crossSlopeWindSpreadRate = 0
    }

    update(fuelIgnition, windSlopeObj, optionsObj={limitWindSpeedFactor:true, limitSpreadRateToWindSpeed:true}) {
        // Get required fuelIgnition input properties
        let {fuelBed, noWindSpreadRate, reactionIntensity} = fuelIgnition

        // Get required wind and slope parameters and computation options
        let {midflameWindSpeed=0, windBearing=0, slopeRatio=0, aspect=180} = windSlopeObj

        let {limitWindSpeedFactor=true, limitSpreadRateToWindSpeed=true} = optionsObj

        // Get required fuelBed input properties
        let {slopeK, windB, windI, windK, residenceTime} = fuelBed

        //----------------------------------------------------------------------
        // OK, here we go...
        //----------------------------------------------------------------------

        const upslopeFromNorth = (aspect + 180) % 360
        const windHeadingFromUpslope = (windBearing - upslopeFromNorth) % 360

        const part = {ros:0, phi: 0, weff: 0}
        let p1={...part}, p2={...part}, p3={...part}, p4={...part}, p5={...part}, p6={...part}, p7={...part}

        //----------------------------------------------------------------------
        // Part 1: no-wind no-slope (nwns) fire spread rate conditions
        //----------------------------------------------------------------------

        p1.ros = noWindSpreadRate

        //----------------------------------------------------------------------
        // Part 2: *ADDITIONAL* fire spread rate due to wind and slope
        // ADDED to the no-wind, no-slope case
        //----------------------------------------------------------------------
        
        // Fire spread rate slope coefficient (ratio).
        // Rothermel's (1972) `phiS' as per equation 51 (p 24, 26).
        const slopeFactor = slopeK * slopeRatio * slopeRatio

        // Fire spread rate wind coefficient (ratio).
        // Rothermel's (1972) `phiW' as per equation 47 (p 23, 26).
        const windFactor = (midflameWindSpeed > 0) ? windK * midflameWindSpeed**windB : 0

        // Wind and slope contributions to the spread rate
        const slopeRos = p1.ros * slopeFactor
        const windRos  = p1.ros * windFactor
        // x- and y-components of the spread rate vector
        let radians = windHeadingFromUpslope * Math.PI / 180
        const xComponent = slopeRos + windRos * Math.cos(radians)
        const yComponent = windRos * Math.sin(radians)
        p2.ros = Math.hypot(xComponent, yComponent)

        //----------------------------------------------------------------------
        // Part 3 - fire spread rate and effective wind for the cross-slope wind condition
        // NO Rothermel's limit applied (effective wind speed < 0.9 Rxi)
        // NO Andrew's limit applied (spread rate < effective wind speed)
        //----------------------------------------------------------------------

        p3.ros = p1.ros + p2.ros
        p3.phi = (p1.ros > 0) ? (p3.ros / p1.ros) - 1 : 0
        p3.weff = this.calcEffectiveWindSpeed(p3.phi, windB, windI)

        // Direction of maximum spread rate (degrees clockwise from upslope)
        // NOTE that p2.ros is used here, NOT p3.ros!
        const al = (p2.ros > 0) ? Math.asin(Math.abs(yComponent) / p2.ros) : 0
        radians = (xComponent >= 0)
            ? (yComponent >= 0 ? al : Math.PI + Math.PI - al)
            : (yComponent >= 0 ? Math.PI - al : Math.PI + al)
        const fireHeadingFromUpslope = radians * 180 / Math.PI
        const fireHeadingFromNorth = (upslopeFromNorth + fireHeadingFromUpslope) % 360

        //----------------------------------------------------------------------
        // Part 4 - fire spread rate and effective wind at the *effective wind speed limit*
        //----------------------------------------------------------------------

        // Maximum effective wind speed limit (ft/min) per Rothermel (1972) equation 86 on page 33.
        p4.weff = 0.9 * reactionIntensity
        p4.phi = (p4.weff > 0) ? windK * p4.weff**windB : 0
        p4.ros = p1.ros * (1 + p4.phi)

        //----------------------------------------------------------------------
        // Part 5 - fire spread rate and effective wind after applying Rothermel's effective wind speed limit
        // YES : Rothermel's wind factor limit is applied (effective wind speed <= 0.9 Rxi)
        // NO  : Andrew's spread rate limit is applied (spread rate <= effective wind speed)
        //----------------------------------------------------------------------

        p5.weff = Math.min(p3.weff, p4.weff)
        p5.phi = Math.min(p3.phi, p4.phi)
        p5.ros = Math.min(p3.ros, p4.ros)

        //----------------------------------------------------------------------
        // Part 6 - fire spread rate and effective wind after applying Andrews' RoS limit
        // NO  : Rothermel's wind factor limit is applied (effective wind speed <= 0.9 Rxi)
        // YES : Andrew's spread rate limit is applied (spread rate <= effective wind speed)
        //----------------------------------------------------------------------

        // If the spread rate exceeds the effective wind speed AND the effective
        // wind speed exceeds 1 mph, then the spread rate is reduced back to the
        // effective wind speed. This was a late change request by project head
        // Pat Andrews to BehavePlus Version 6.
        p6.ros = p3.ros
        p6.phi = p3.phi
        p6.weff = p3.weff
        if (p3.ros > p3.weff && p3.weff > 88) {
            p6.ros = p3.weff// reduce spread rate to the effective wind speed
            p6.phi = (p1.ros > 0) ?  p6.ros / p1.ros - 1 : 0
            p6.weff = this.calcEffectiveWindSpeed(p6.phi, windB, windI)
        }

        //----------------------------------------------------------------------
        // Part 7 - both Rothermel's and Andrew's limits are applied
        // YES : Rothermel's limit applied (effective wind speed < 0.9 Rxi)
        // YES : Andrew's limit applied (spread rate < effective wind speed)
        //----------------------------------------------------------------------

        // Begin with Rothermel's wind factor < fire power limited values
        p7.ros = p5.ros
        p7.phi = p5.phi
        p7.weff = p5.weff
        // Apply Andrew's spread rate < wind speed assertion
        if (p5.ros > p5.weff && p5.weff > 88) {
            p7.ros = p5.weff    // reduce spread rate to the effective wind speed
            p7.phi = (p1.ros > 0) ?  p7.ros / p1.ros - 1 : 0
            p7.weff = this.calcEffectiveWindSpeed(p7.phi, windB, windI)
        }

        //----------------------------------------------------------------------
        // Part 8 - apply the appropriate spread rate, spread rate factor, and
        // effective wind speed, depending upin configuration
        //----------------------------------------------------------------------

        let p
        // limit wind coefficient to 0.9 * (windSpeed / reactionIntensity)
        if (limitWindSpeedFactor) 
            // limit max spread rate to effective wind speed
            p = limitSpreadRateToWindSpeed ? p7 : p5
        else
            p = limitSpreadRateToWindSpeed ? p6 : p3

        // Fire heat per unit area. (BTU/ft2)
        const heatPerUnitArea = reactionIntensity * residenceTime

        // Fireline intensity (BTU/ft/s)
        const firelineIntensity = p.ros * reactionIntensity * residenceTime / 60

        // Byram's (1959) flame length (ft)
        const flameLength = (firelineIntensity > 0) ? 0.45 * firelineIntensity**0.46 : 0

        // Fire ellipse length-to-width ratio from the effective wind speed (ft/min)
        // Uses Anderson's (1983) equation.
        // *** NOTE: Wind speed MUST be converted to miles per hour***
        const lengthWidthRatio = 1 + 0.25 * (p.weff / 88)

        // Save whatever is needed for use further downstream
        this.headingSpreadRate = p.ros
        this.effWindFactor = p.phi
        this.effWindSpeed = p.weff
        this.headingFromUpslope = fireHeadingFromUpslope
        this.bearing = fireHeadingFromNorth
        this.heatPerUnitArea = heatPerUnitArea
        this.firelineIntensity = firelineIntensity
        this.flameLength = flameLength
        this.lengthWidthRatio = lengthWidthRatio
        this.midflameWindSpeed = midflameWindSpeed
        // following are used by WeightedFireBehavior()
        this.reactionIntensity = reactionIntensity
        this.effWindLimitExceeded = (p3.weff > p4.weff)
        this.effWindSpeedLimit = p4.weff
        this.residenceTime = residenceTime
        this.spreadRateLimit = p4.ros
        this.slopeFactor = slopeFactor
        this.upslopeFromNorth = upslopeFromNorth
        this.windFactor = windFactor
        this.windHeadingFromUpslope = windHeadingFromUpslope
        this.noWindNoSlopeSpreadRate = p1.ros
        this.additionalWindSlopeSpreadRate = p2.ros
        this.xComponent = xComponent
        this.yComponent = yComponent
        this.crossSlopeWindSpreadRate = p3.ros
        return this
    }

    calcEffectiveWindSpeed(phiew, windB, windI) {
        let ews = 0
        if (phiew > 0 && windB > 0 && windI > 0) {
            const a = phiew * windI
            const b = 1.0 / windB
            ews = a**b
        }
        return ews
    }

    scorchHeight(airTemp=77) {
        return getScorchHeight(this.firelineIntensity, airTemp, this.midflameWindSpeed)
    }
}
