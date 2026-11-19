/**
 * Base class for the 5 aspen fuel models after Brown and Simmerman.
 * - AspenShrubFuel
 * - AspenTallForbFuel
 * - AspenLowForbFuel
 * - MixedForbFuel
 * - MixedShrubFuel
 */
export class AspenFuel {
    constructor(type, curing=0){
        if(type<0 || type>4)
            throw new Error(`AspenFuel 'type' must be index in range [0-4], but received ${type}.`)
        this.type = type
        this.deadMext = 0.25
        this.depth = [0.65, 0.30, 0.18, 0.50, 0.18][type]
        // Returns Aspen dead 0.25 - 1.0" savr (ft2/ft3).
        this.dead10Savr = 109
        this.liveHerbSavr = 2800
        this.update(curing)
    }

    update(curing) {
        this.curing = curing

        const Dead1Loads = [
            [0.800, 0.893, 1.056, 1.218, 1.379, 1.4595 ],
            [0.738, 0.930, 1.056, 1.183, 1.309, 1.3720 ],
            [0.601, 0.645, 0.671, 0.699, 0.730, 0.7455 ],
            [0.880, 0.906, 1.037, 1.167, 1.300, 1.3665 ],
            [0.754, 0.797, 0.825, 0.854, 0.884, 0.8990 ],
            //[0.754, 0.797, 0.825, 1.167, 0.884, 0.8990 ],
        ]
        this.dead1Load = this.#interpolate(this.curing, Dead1Loads[this.type])
            * 2000/43560

        this.dead10Load = [0.975, 0.475, 1.035, 1.340, 1.115][this.type]
            * 2000/43560

        const LiveHerbLoads = [
            [0.335, 0.234, 0.167, 0.100, 0.033, 0.000 ],
            [0.665, 0.465, 0.332, 0.199, 0.067, 0.000 ],
            [0.150, 0.105, 0.075, 0.045, 0.015, 0.000 ],
            [0.100, 0.070, 0.050, 0.030, 0.010, 0.000 ],
            [0.150, 0.105, 0.075, 0.045, 0.015, 0.000 ]
        ]
        this.liveHerbLoad = this.#interpolate(this.curing, LiveHerbLoads[this.type])
            * 2000/43560

        const LiveWoodyLoads = [
            [0.403, 0.403, 0.333, 0.283, 0.277, 0.274 ],
            [0.000, 0.000, 0.000, 0.000, 0.000, 0.000 ],
            [0.000, 0.000, 0.000, 0.000, 0.000, 0.000 ],
            [0.455, 0.455, 0.364, 0.290, 0.261, 0.2465 ],
            [0.000, 0.000, 0.000, 0.000, 0.000, 0.000 ],
        ]
        this.liveWoodyLoad = this.#interpolate(this.curing, LiveWoodyLoads[this.type])
            * 2000/43560

        const Dead1Savrs = [
            [1440., 1620., 1910., 2090., 2220., 2285.],
            [1480., 1890., 2050., 2160., 2240., 2280.],
            [1400., 1540., 1620., 1690., 1750., 1780.],
            [1350., 1420., 1710., 1910., 2060., 2135.],
            [1420., 1540., 1610., 1670., 1720., 1745.],
        ]
        this.dead1Savr = this.#interpolate(this.curing, Dead1Savrs[this.type])

        const LiveWoodySavrs = [
            [2440., 2440., 2310., 2090., 1670., 1670.],
            [2440., 2440., 2440., 2440., 2440., 2440.],
            [2440., 2440., 2440., 2440., 2440., 2440.],
            [2530., 2530., 2410., 2210., 1800., 1800.],
            [2440., 2440., 2440., 2440., 2440., 2440.],
        ]
        this.liveWoodySavr = this.#interpolate(this.curing, LiveWoodySavrs[this.type])

    }
    /**
    * Estimate
    * @param {*} severity  severity Fire severity level: 0 = low severity, 1= moderate+ severity
    * @param {*} flameLength Flame length of the fire at the tree (ft).
    * @param {*} dbh Aspen diameter at breast height (in).
    * @returns  Aspen mortality rate (fraction).
    */
    mortality(severity, flameLength, dbh) {
        let mort = 1
        let ch = flameLength / 1.8
        if (severity === 0) {
            mort = 1 / (1 + Math.exp(-4.407 + 0.638 * dbh - 2.134 * ch))
        } else if (severity === 1) {
            mort = 1 / (1 + Math.exp(-2.157 + 0.218 * dbh - 3.600 * ch))
        }
        mort = Math.max(0, Math.min(mort, 1))
        return mort
    }

    #interpolate(curing, values) {
        const Curing = [0.0, 0.3, 0.5, 0.7, 0.9, 1.000000001]
        curing = Math.max(0, Math.min(curing, 1))
        let fraction = 0
        let value = 0
        for (let i=1; i<Curing.length; i++) {
            if (curing < Curing[i]) {
                fraction = 1 - (Curing[i] - curing) / (Curing[i] - Curing[i-1])
                value = values[i-1] + fraction * (values[i] - values[i-1])
                break
            }
        }
        return value
    }
}
// 0 = Aspen/shrub
// 1 = Aspen/tall forb
// 2 = Aspen/low forb
// 3 = Mixed/forb
// 4 = Mixed/shrub

export class AspenShrubFuel extends AspenFuel {
    constructor(curing=0) {
        super(0, curing)
        this.label = 'Aspen/shrub'
    }
}

export class AspenTallForbFuel extends AspenFuel {
    constructor(curing=0) {
        super(1, curing)
        this.label = 'Aspen/tall forb'
    }
}

export class AspenLowForbFuel extends AspenFuel {
    constructor(curing=0) {
        super(2, curing)
        this.label = 'Aspen/low forb'
    }
}

export class MixedForbFuel extends AspenFuel {
    constructor(curing=0) {
        super(3, curing)
        this.label = 'Mixed forb'
    }
}

export class MixedhrubFuel extends AspenFuel {
    constructor(curing=0) {
        super(4, curing)
        this.label = 'Mixed shrub'
    }
}

const fm = new AspenShrubFuel(0.5)
console.log(fm)