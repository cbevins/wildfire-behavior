// Params used for testing against BehavePlus 5 and 6
export const ParamsBp6 = {
    // Creating a FuelModel
    fuelKey: '10',
    // Updating the FuelBed
    curedHerb: 0.778,
    // Updating the FuelIgnition
    moistureDead1h: 0.05,
    moistureDead10h: 0.07,
    moistureDead100h: 0.09,
    moistureLiveHerb: 0.5,
    moistureLiveStem: 1.5,
    // Updating the FireBehavior
    midflameWindSpeed: 10*88,
    windBearing: 90,
    slopeRatio: 0.25,                   // slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 95,                        // only used by vector scorch height
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    // Updating the FireSize
    elapsedTime: 60,
    ignEast: 0,
    ignNorth: 0,
    ignX: 0,
    ignY: 0,
    // Updating the FireVectors
    betaFromHead: 45,
    psiFromHead: 45,
    calcVectorFlameLength: true,
    // Updating midflame wind speed
    canopyBase: 10,
    canopyHeight: 100,
    canopyCover: 0.75,
}

// Params used for testing against BehavePlus 5 and 6
export const ParamsZero = {
    // Creating a FuelModel
    fuelKey: 101,
    // Updating the FuelBed
    curedHerb: 0,
    // Updating the FuelIgnition
    moistureDead1h: 0.1,
    moistureDead10h: 0.1,
    moistureDead100h: 0.1,
    moistureLiveHerb: 3,
    moistureLiveStem: 3,
    // Updating the FireBehavior
    midflameWindSpeed: 0,
    windBearing: 0,
    slopeRatio: 0,                   // slopeDegrees: 14.03624347,
    aspect: 180,
    airTemp: 77,                        // only used by vector scorch height
    limitWindSpeedFactor: true,
    limitSpreadRateToWindSpeed: true,
    // Updating the FireSize
    elapsedTime: 0,
    ignEast: 0,
    ignNorth: 0,
    ignX: 0,
    ignY: 0,
    // Updating the FireVectors
    betaFromHead: 0,
    psiFromHead: 0,
    calcVectorFlameLength: true,
    // Updating midflame wind speed
    canopyBase: 0,
    canopyHeight: 0,
    canopyCover: 0,
}
