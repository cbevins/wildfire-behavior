export class WeightedFireBehavior {
    constructor() {
        this.init()
    }
    init() {
        this.bearing = 0
        this.effWindFactor = 0
        this.effWindSpeed = 0
        this.headingFromUpslope = 0
        this.lengthWidthRatio = 0
        this.midflameWindSpeed = 0
        this.reactionIntensity =  0
        this.heatPerUnitArea = 0
        this.firelineIntensity = 0
        this.flameLength = 0
        this.effWindLimitExceeded = false
        this.effWindSpeedLimit = 0
        this.arithmeticMeanSpreadRate = 0
        this.harmonicMeanSpreadRate = 0
        this.headingSpreadRate = 0
    }
    update(fireBehavior1, fireBehavior2, fuelCover1, fuelModelWeighting) {
        this.init()
        const fb1 = fireBehavior1
        const fb2 = fireBehavior2

        // The following 6 (or maybe 7) are ALWAYS bound to the primary fuel
        this.bearing = fb1.bearing
        this.effWindFactor = fb1.effWindFactor
        this.effWindSpeed = fb1.effWindSpeed
        this.headingFromUpslope = fb1.headingFromUpslope
        this.lengthWidthRatio = fb1.lengthWidthRatio
        this.midflameWindSpeed = fb1.midflameWindSpeed

        // The following 4 use the maximum of the primary or secondary fuel
        this.reactionIntensity = Math.max(fb1.reactionIntensity, fb2.reactionIntensity)
        this.heatPerUnitArea = Math.max(fb1.heatPerUnitArea, fb2.heatPerUnitArea)
        this.firelineIntensity = Math.max(fb1.firelineIntensity, fb2.firelineIntensity)
        this.flameLength = Math.max(fb1.flameLength, fb2.flameLength)

        // If either fuel bed's effective wind speed limit is exceeded
        this.effWindLimitExceeded = (fb1.effWindLimitExceeded || fb2.effWindLimitExceeded)
        // The effective wind speed limit is the minimum of either
        this.effWindSpeedLimit = Math.min(fb1.effWindSpeedLimit, fb2.effWindSpeedLimit)

        // Arithmetic and harmonic means
        this.arithmeticMeanSpreadRate = this.getArithmeticMeanSpreadRate(
            fuelCover1, fb1.headingSpreadRate, fb2.headingSpreadRate)
        this.harmonicMeanSpreadRate = this.getHarmonicMeanSpreadRate(
            fuelCover1, fb1.headingSpreadRate, fb2.headingSpreadRate)

        // BP6 also saved the primary fuel's wind speed reduction factor,
        // but that's a pain to get from here, may not have ever been calculated,
        // and I'm not sure if its used by ellipse anywhere else?

        this.headingSpreadRate = this.arithmeticMeanSpreadRate
        if (fuelModelWeighting === 'harmonic') {
            this.headingSpreadRate = this.harmonicMeanSpreadRate
        } else if (fuelModelWeighting === 'primary') {
            this.headingSpreadRate = fb1.headingSpreadRate
        }
    }

    getArithmeticMeanSpreadRate (cover1, ros1, ros2) {
        return cover1 * ros1 + (1 - cover1) * ros2
    }

    getHarmonicMeanSpreadRate (cover1, ros1, ros2) {
        if (cover1 === 0 || ros1 === 0) return ros2
        if (ros2 === 0) return ros1
        return 1 / (cover1 / ros1 + (1 - cover1) / ros2)
    }
}
