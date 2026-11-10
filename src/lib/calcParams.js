
/**
 * Calculates the canopy fuel load (lb/ft2)
 * @param {object} param Object with props {canopyBulkDensity=0, canopyLength=0}
 * @returns Canopy fuel load (lb/ft2)
 */
export function calcCanopyFuelLoad(params) {
    const {canopyBulkDensity=0, canopyLength=0} = params
    const canopyFuelLoad = canopyBulkDensity * canopyLength
    return canopyFuelLoad
}

/**
 * Determines canopy heat per unit area (Btu/ft2)
 * @param {object} param Object with props {canopyFuelLoad, canopyFuelHeat}
 * @returns Canopy heat per unit area (Btu/ft2)
 */
export function calcCanopyFuelHpua(params) {
    const {canopyFuelLoad=0, canopyFuelHeat=8000} = params
    const canopyFuelHpua = canopyFuelLoad * canopyFuelHeat
    return canopyFuelHpua
}
