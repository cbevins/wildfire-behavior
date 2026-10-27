export class ActiveCrownFire {
    constructor() {
        this.init()
    }
    
    init() {
        this.activeSpreadRate = 0
        this.activeFirelineIntensity = 0
        this.activeFlameLength = 0
        this.activeHeatPerUnitArea = 0
        this.isPlumeDominated = false
        this.isWindDriven = false
        this.powerOfTheFire = 0
        this.powerOfTheWind = 0
        this.fireWindPowerRatio = 0
        this.fuelModel10SpreadRate = 0
        this.canopyHeatPerUnitArea = 0
        this.surfaceHeatPerUnitArea = 0
        this.windSpeed20ft = 0
    }

    update(fuelModel10SpreadRate, surfaceFuelsHpua, canopyFuelsHpua, windSpeed20ft) {
        // Rothermel's crown fire spread rate (ft/min)
        const activeRos = 3.34 * fuelModel10SpreadRate

        // Active crown fire heat per unit area is the sum of the surface fire HPUA
        // and the entire active canopy HPUA (i.e., canopy load * canopy heat content),
        // and IS NOT the fuel model 10 HPUA.
        const activeHpua = surfaceFuelsHpua + canopyFuelsHpua

        // Crown fire fireline intensity (Btu/ft/s)
        const activeFli = activeHpua * (activeRos / 60)

        // Crown fire flame length using Thomas (1963)
        const activeFlame = activeFli <= 0 ? 0 : 0.2 * Math.pow(activeFli, 2 / 3)

        // Rothermel's power-of-the-fire (ft-lb/ft2/s)
        const firePower = activeFli / 129

        // Rothermel's power-of-the-wind (ft-lb/ft2/s)
        const diff = Math.max(0, (windSpeed20ft - activeRos) / 60) // Difference must be in ft/s
        const windPower = 0.00106 * diff * diff * diff

        const powerRatio = (windPower>0) ? (firePower / windPower) : 0

        this.activeSpreadRate = activeRos
        this.activeFirelineIntensity = activeFli
        this.activeFlameLength = activeFlame
        this.activeHeatPerUnitArea = activeHpua
        this.isPlumeDominated = powerRatio >= 1
        this.isWindDriven = powerRatio < 1
        this.powerOfTheFire = firePower
        this.powerOfTheWind = windPower
        this.fireWindPowerRatio = powerRatio
        // inputs
        this.fuelModel10SpreadRate = fuelModel10SpreadRate
        this.canopyHeatPerUnitArea = canopyFuelsHpua
        this.surfaceHeatPerUnitArea = surfaceFuelsHpua
        this.windSpeed20ft = windSpeed20ft
    }
}
