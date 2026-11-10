/**
 * Determines the wind speed reduction factor (wsrf) under a canopy.
 * The wsrf is multiplied by the wind speed at top of the canopy (or 20-ft) to
 * estimate the midflame wind speed. (Thus, when wrsf===1, there is no reduction)
 * 
 * @param {object} params Object with the following properties:
 * - canopyBase: canopy base height (ft)
 * - canopyHeight: height of canopy top (ft)
 * - canopyCover: portion of ground with canopy above it (fraction)
 * @returns canopy wind speed reduction factor [0..1]
 */
export function calcCanopyMidflameWsrf(params) {
    const {canopyBase=0, canopyHeight=0, canopyCover=0} = params

    if (canopyCover <= 0.01 || canopyHeight < 6)
        return 1

    const crownRatio = (Math.max(0, canopyHeight - canopyBase) / canopyHeight)
    const canopyFill = canopyCover * crownRatio / 3
    if (canopyFill < 0.05)
        return 1

    const wsrf = 0.555 / (Math.sqrt(canopyFill * canopyHeight)
        * Math.log((20 + 0.36 * canopyHeight) / (0.13 * canopyHeight)))
    return wsrf
}

/**
 * Determines the midflame windspeed reduction factor (wsrf)
 * within a fuel bed under no canopy.
 * The wsrf is multiplied by the wind speed at top of the canopy (or 20-ft) to
 * estimate the midflame wind speed. (Thus, when wrsf===1, there is no reduction)
 * 
 * @param {number} depth Fuel bed depth (ft)
 */
export function calcFuelBedMidflameWsrf(depth) {
    const f = Math.min(6, Math.max(depth, 0.1))
    const wsrf = 1.83 / Math.log((20 + 0.36 * f) / (0.13 * f))
    return wsrf
}
