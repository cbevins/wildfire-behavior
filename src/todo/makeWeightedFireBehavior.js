export function makeWeightedFireBehavior(fireBehavior1, fireBehavior2,
        fuelCover1, fuelModelWeighting='arithmetic') {
    const fb1 = fireBehavior1
    const fb2 = fireBehavior2

    const pod = {
        // The following 6 (or maybe 7) are ALWAYS bound to the primary fuel
        bearing: fb1.bearing,
        effWindFactor: fb1.effWindFactor,
        effWindSpeed: fb1.effWindSpeed,
        headingFromUpslope: fb1.headingFromUpslope,
        lengthWidthRatio: fb1.lengthWidthRatio,
        midflameWindSpeed: fb1.midflameWindSpeed,
        // The following 4 use the maximum of the primary or secondary fuel
        reactionIntensity: Math.max(fb1.reactionIntensity, fb2.reactionIntensity),
        heatPerUnitArea: Math.max(fb1.heatPerUnitArea, fb2.heatPerUnitArea),
        firelineIntensity: Math.max(fb1.firelineIntensity, fb2.firelineIntensity),
        flameLength: Math.max(fb1.flameLength, fb2.flameLength),
        // If either fuel bed's effective wind speed limit is exceeded
        effWindLimitExceeded: (fb1.effWindLimitExceeded || fb2.effWindLimitExceeded),
        // The effective wind speed limit is the minimum of either
        effWindSpeedLimit: Math.min(fb1.effWindSpeedLimit, fb2.effWindSpeedLimit),
        // Arithmetic and harmonic means
        arithmeticMeanSpreadRate: getArithmeticMeanSpreadRate(fuelCover1, fb1.headingSpreadRate, fb2.headingSpreadRate),
        harmonicMeanSpreadRate: getHarmonicMeanSpreadRate(fuelCover1, fb1.headingSpreadRate, fb2.headingSpreadRate),
    }

    // BP6 also saved the primary fuel's wind speed reduction factor,
    // but that's a pain to get from here, may not have ever been calculated,
    // and I'm not sure if its used by ellipse anywhere else?

    pod.headingSpreadRate = pod.arithmeticMeanSpreadRate
    if (fuelModelWeighting === 'harmonic') {
        pod.headingSpreadRate = pod.harmonicMeanSpreadRate
    } else if (fuelModelWeighting === 'primary') {
        pod.headingSpreadRate = fb1.headingSpreadRate
    }
    return pod
}

export function getArithmeticMeanSpreadRate (cover1, ros1, ros2) {
    return cover1 * ros1 + (1 - cover1) * ros2
}

export function getHarmonicMeanSpreadRate (cover1, ros1, ros2) {
    if (cover1 === 0 || ros1 === 0) {
        return ros2
    } else if (ros2 === 0) {
        return ros1
    }
    return 1 / (cover1 / ros1 + (1 - cover1) / ros2)
}
