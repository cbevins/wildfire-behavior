/**
This file contains definitions of the *standard* fire behavior fuel models:
    - the original 13 fuel models documented by Anderson 1982 (after Rothermel 1972 and Albini 1976),
        and used by the LANDFIRE FMFM13 layer,
    - the 40 additional fuel models published by Scott & Burgan,
        and used by the LANDFIRE FBFM40 layer, and
    - the 5 'non-burnable' fuel types used by the LANDFIRE FBFM40 layer
----------------------------------------------------------------------------
Part 1: Fuel Particles
----------------------------------------------------------------------------

The implementation of 'fuel models' defined below permits the definition of 'custom'
fuel models with their own dead/live/curable fuel moisture clases.

----------------------------------------------------------------------------
Part 1: Fuel Particles
----------------------------------------------------------------------------

Every fuel model has one or more FuelParticle objects that are created by
the makeParticle() function defined below.
*/

/**
 * Creates a FuelParticle object.
 * @param {string} life The "life" property is one of the following strings: "dead", "live", or "curable".
 * @param {string} deadMoistureClass Key into an object that holds this particle's dead fuel moisture content.
 * The standard FBFMs only use the "moistureDead1h", "moistureDead10h", and "moistureDead100h" keys,
 * but clients may define additional keys as needed, such as "deadCheatgrass" or 'deadChaparralStem'.
 * @param {string} liveMoistureClass Key into an object that holds this particle's live fuel moisture content.
 * The standard FBFMs only use the "moistureLiveHerb", and "moistureLiveStem" keys,
 * but clients may define additional keys as needed, such as "liveCheatgrass" or 'liveChaparralStem'.
 * @param {number} ovendryLoad ovendry weight in lb/ft2 [where lb/ft2 = 0.004591368227731864 * ton/ac]
 * @param {number} savr surface area-to-volume ratio as ft2 particle surface area / ft3 particle volume
 * @param {number} heat low heat of of combustion (or low heat content) (Btu/lb)
 * @param {number} density fuel particle fiber density (lb/ft3)
 * @param {number} totalMineral fuel particle total mineral content (lb minerals / lb ovendry wood)
 * @param {number} effectiveMineral fuel particle "effective" (non-silica) mineral content (lb silica-free minerals / lb ovendry wood)
 * @param {string} curingClass Key into an object that holds this particle's cured fuel fraction.
 * This is used ONLY by particles whose life==='curable'. The standard FBFMs only use the "curedHerb" key,
 * but clients may define additional keys as needed, such as "curedCheatgrass" or 'chaparralStem'.
 */
export function makeParticle(life="dead", deadMoistureClass="moistureDead1h", liveMoistureClass="moistureLiveStem",
    ovendryLoad=0, savr=1, heat=8000, density=32, totalMineral=0.0555, effectiveMineral=0.01, curingClass="curedHerb") {
        return {life, deadMoistureClass, liveMoistureClass,
            ovendryLoad, savr, heat, density, totalMineral, effectiveMineral, curingClass}
}

/*
----------------------------------------------------------------------------
Dead Category FuelParticles
----------------------------------------------------------------------------

Dead category fuels are classified based upon their fuel moisture "time-lag" classes
(1-, 10, or 100-h) indicating their response time to changes in ambient temperature
humidity, solar radiation, and precipitation.  The time-lag, in turn, depends
primarily upon dead particle size as expressed by its surface-area-to-volume ratio.

Dead 1-h fuel moisture time-lag class particles have a surface area-to-volume ratio
less than 192 ft2/ft3 (equivalent to a 0.25-in diameter cylinder). The standard fire
behavior fuel model surface-area-to-volume ratios for dead 1-h fuels range from
750 to 3500 ft2/ft3 (0.064 to 0.0137 inch diameter).
*/
export function dead1h(ovendryLoad, savr, heat=8000) {
    return makeParticle("dead", "moistureDead1h", "moistureLiveStem", ovendryLoad, savr, heat)
}

/* Dead 10-h fuel moisture time-lag class particles have a surface area-to-volume ratio
between 48 and 192 ft2/ft3 (1 to 0.25 inch diameter).  The standard fire behavior fuel models
use a fixed surface-area-to-volume ratio of 109 1/ft (0.44-in diameter) for dead 10-h fuels.
*/
export function dead10h(ovendryLoad, savr=109, heat=8000) {
    return makeParticle("dead", "moistureDead10h", "moistureLiveStem", ovendryLoad, savr, heat)
}

/* Dead 100-h fuel moisture time-lag class particles have a surface area-to-volume ratio
between 192 and 16 ft2/ft3 (1 to 3 inch diameter).  The standard fire behavior fuel models
use a fixed surface-area-to-volume ratio of 30 (1.6-in diameter) for dead 100-h fuels.
*/
export function dead100h(ovendryLoad, savr=30, heat=8000) {
    return makeParticle("dead", "moistureDead100h", "moistureLiveStem", ovendryLoad, savr, heat)
}

/*
----------------------------------------------------------------------------
Live Category FuelParticles
----------------------------------------------------------------------------

Live category fuels are able to regulate their moisture content independently
(more or less) of synoptic ambient weather conditions.

Live stem fuels refer to the living, above-ground woody branches, twigs, and
stems of shrubs and trees. While their moisture contents may range seasonally
from 50% to 300%, they generally DO NOT cure or die out during the season.
Standard fire behavior fuel model surface area-to-volume ratios for stems 
range from 750 to 2000 ft2/ft3 (0.064 to 0.024 inch diameter).
*/
export function liveStem(ovendryLoad, savr, heat=8000) {
    return makeParticle("live", "moistureDead1h", "moistureLiveStem", ovendryLoad, savr, heat)
}

/* Live herb fuels include grasses, forbs, and ferns DO NOT cure during the season.
Standard fire behavior fuel model surface area-to-volume ratios for herbs range
from 1300 to 2000 ft2/ft3 (0.369 to 0.024 inches).
*/
export function liveHerb(ovendryLoad, savr, heat=8000) {
    return makeParticle("live", "moistureDead1h", "moistureLiveHerb", ovendryLoad, savr, heat)
}

/*
----------------------------------------------------------------------------
Curable Category FuelParticles
----------------------------------------------------------------------------

Curable herb fuels include grasses, forbs, and ferns that may cure during the season.
The BehavePlus wildland fire modeling system considers herbs to be fully live
when their moisture content exceeds 120%, and fully cured (dead) when below 30%.

Scott and Burgan define 17 fuel models with curable (primarily grass) fue particle components:
101-109 (the grass series), 121-124 (the grass-shrub series), 141 (sh1), 149 (sh9),
161 (tu1, timber-grass-shrub), and 163 (tu3, timber-grass-shrub).

Standard fire behavior fuel model surface area-to-volume ratios for herbs range
from 1300 to 2000 ft2/ft3 (0.369 to 0.024 inches).
*/
export function curableHerb(ovendryLoad, savr, heat=8000) {
    return makeParticle("curable", "moistureDead1h", "moistureLiveHerb", ovendryLoad, savr, heat)
}

// ----------------------------------------------------------------------------
// Part 2 FuelModel Class Definition
// ----------------------------------------------------------------------------

// Standard fuel models are differentiated by their fuel bed depth (ft), dead fuel
// moisture content of extinction, and number and types of FuelParticles.
/**
 * 
 * @param {number} number a standard, assigned fuel model number, used as a lookup key
 * @param {string} code a standard, assigned fuel model alphanumeric code, also used as a lookup key
 * @param {string} label a brief label
 * @param {string} source 'Anderson', 'Scott & Burgan', etc
 * @param {string} desc a longer description
 * @param {number} depth fuel bed depth (ft)
 * @param {number} deadMext dead fuel moisture content of extinction (lb water /lb ovendry fuel)
 * @param {array} particles array of FuelParticle objects
 * @returns FuelModel object
 */
export function model(number, code, label, source, desc, depth, deadMext, particles=[]) {
    return {number, code, label, source, desc, depth, deadMext, particles}
}

// ----------------------------------------------------------------------------
// Part 3 Array of the standard FuelModels
// ----------------------------------------------------------------------------

export const FuelModels = [
    model( 0, "none", "Anderson 1982", "No Fuel",
        "No fuel, unknown, undefined",
        0, 0, [
        ],
    ),
    model( 1, "1", "Anderson 1982", "Short grass",
        "Surface fires that burn fine herbaceous fuels, cured and curing fuels, little shrub or timber present, primarily grasslands and savanna",
        1, 0.12, [
            dead1h(0.034, 3500, 8000),
        ],
    ),
    model( 2, "2", "Anderson 1982", "Timber grass and understory",
        "Burns fine, herbaceous fuels, stand is curing or dead, may produce fire brands on oak or pine stands",
        1, 0.15, [
            dead1h(0.092, 3000, 8000),
            dead10h(0.046),
            dead100h(0.023),
            liveStem(0.023, 1500),
        ],
    ),
    model( 3, "3", "Anderson 1982", "Tall grass",
        "Most intense fire of grass group, spreads quickly with wind, one third of stand dead or cured, stands average 3 ft tall",
        2.5, 0.25, [
            dead1h(0.138, 1500, 8000),
        ],
    ),
    model( 4, "4", "Anderson 1982", "Chaparral",
        "Fast spreading fire, continuous overstory, flammable foliage and dead woody material, deep litter layer can inhibit suppression",
        6, 0.2, [
            dead1h(0.23, 2000, 8000),
            dead10h(0.184),
            dead100h(0.092),
            liveStem(0.23, 1500),
        ],
    ),
    model( 5, "5", "Anderson 1982", "Brush",
        "Low intensity fires, young, green shrubs with little dead material, fuels consist of litter from understory",
        2, 0.2, [
            dead1h(0.046, 2000, 8000),
            dead10h(0.023),
            liveStem(0.092, 1500),
        ],
    ),
    model( 6, "6", "Anderson 1982", "Dormant brush, hardwood slash",
        "Broad range of shrubs, fire requires moderate winds to maintain flame at shrub height, or will drop to the ground with low winds",
        2.5, 0.25, [
            dead1h(0.069, 1750, 8000),
            dead10h(0.115),
            dead100h(0.092),
        ],
    ),
    model( 7, "7", "Anderson 1982", "Southern rough",
        "Foliage highly flammable, allowing fire to reach shrub strata levels, shrubs generally 2 to 6 feet high",
        2.5, 0.4, [
            dead1h(0.052, 1750, 8000),
            dead10h(0.086),
            dead100h(0.069),
            liveStem(0.017, 1500),
        ],
    ),
    model( 8, "8", "Anderson 1982", "Short needle litter",
        "Slow, ground burning fires, closed canopy stands with short needle conifers or hardwoods, litter consist mainly of needles and leaves, with little undergrowth, occasional flares with concentrated fuels",
        0.2, 0.3, [
            dead1h(0.069, 2000, 8000),
            dead10h(0.046),
            dead100h(0.115),
        ],
    ),
    model( 9, "9", "Anderson 1982", "Long needle or hardwood litter",
        "Longer flames, quicker surface fires, closed canopy stands of long-needles or hardwoods, rolling leaves in fall can cause spotting, dead-down material can cause occasional crowning",
        0.2, 0.25, [
            dead1h(0.134, 2500, 8000),
            dead10h(0.019),
            dead100h(0.007),
        ],
    ),
    model( 10, "10", "Anderson 1982", "Timber litter & understory",
        "Surface and ground fire more intense, dead-down fuels more abundant, frequent crowning and spotting causing fire control to be more difficult",
        1, 0.25, [
            dead1h(0.138, 2000, 8000),
            dead10h(0.092),
            dead100h(0.23),
            liveStem(0.092, 1500),
        ],
    ),
    model( 11, "11", "Anderson 1982", "Light logging slash",
        "Fairly active fire, fuels consist of slash and herbaceous materials, slash originates from light partial cuts or thinning projects, fire is limited by spacing of fuel load and shade from overstory",
        1, 0.15, [
            dead1h(0.069, 1500, 8000),
            dead10h(0.207),
            dead100h(0.253),
        ],
    ),
    model( 12, "12", "Anderson 1982", "Medium logging slash",
        "Rapid spreading and high intensity fires, dominated by slash resulting from heavy thinning projects and clearcuts, slash is mostly 3 inches or less",
        2.3, 0.2, [
            dead1h(0.184, 1500, 8000),
            dead10h(0.644),
            dead100h(0.759),
        ],
    ),
    model( 13, "13", "Anderson 1982", "Heavy logging slash",
        "Fire spreads quickly through smaller material and intensity builds slowly as large material ignites, continuous layer of slash larger than 3 inches in diameter predominates, resulting from clearcuts and heavy partial cuts, active flames sustained for long periods of time, fire is susceptible to spotting and weather conditions",
        3, 0.25, [
            dead1h(0.322, 1500, 8000),
            dead10h(1.058),
            dead100h(1.288),
        ],
    ),
    model( 91, "nb1", "LANDFIRE", "Urban / Developed",
        "Urban/Developed",
        0, 0, [
        ],
    ),
    model( 92, "nb2", "LANDFIRE", "Snow / Ice",
        "Snow/Ice",
        0, 0, [
        ],
    ),
    model( 93, "nb3", "LANDFIRE", "Agriculture",
        "Agricultural",
        0, 0, [
        ],
    ),
    model( 98, "nb8", "LANDFIRE", "Open Water",
        "Open Water",
        0, 0, [
        ],
    ),
    model( 99, "nb9", "LANDFIRE", "Barren",
        "Barren",
        0, 0, [
        ],
    ),
    model( 101, "gr1", "Scott & Burgan 2005", "Short, sparse, dry climate grass",
        "Short, sparse dry climate grass is short, naturally or heavy grazing, predicted rate of fire spread and flame length low ",
        0.4, 0.15, [
            dead1h(0.004591368227731864, 2200, 8000),
            curableHerb(0.013774104683195591, 2000, 8000),
        ],
    ),
    model( 102, "gr2", "Scott & Burgan 2005", "Low load, dry climate grass",
        "Low load, dry climate grass primarily grass with some small amounts of fine, dead fuel, any shrubs do not affect fire behavior",
        1, 0.15, [
            dead1h(0.004591368227731864, 2000, 8000),
            curableHerb(0.04591368227731864, 1800, 8000),
        ],
    ),
    model( 103, "gr3", "Scott & Burgan 2005", "Low load, very coarse, humid climate grass",
        "Low load, very coarse, humid climate grass continuous, coarse humid climate grass, any shrubs do not affect fire behavior",
        2, 0.3, [
            dead1h(0.004591368227731864, 1500, 8000),
            dead10h(0.018365472910927456),
            curableHerb(0.06887052341597796, 1300, 8000),
        ],
    ),
    model( 104, "gr4", "Scott & Burgan 2005", "Moderate load, dry climate grass",
        "Moderate load, dry climate grass, continuous, dry climate grass, fuelbed depth about 2 feet",
        2, 0.15, [
            dead1h(0.01147842056932966, 2000, 8000),
            curableHerb(0.0872359963269054, 1800, 8000),
        ],
    ),
    model( 105, "gr5", "Scott & Burgan 2005", "Low load, humid climate grass",
        "Low load, humid climate grass, fuelbed depth is about 1-2 feet",
        1.5, 0.4, [
            dead1h(0.018365472910927456, 1800, 8000),
            curableHerb(0.11478420569329659, 1600, 8000),
        ],
    ),
    model( 106, "gr6", "Scott & Burgan 2005", "Moderate load, humid climate grass",
        "Moderate load, continuous humid climate grass, not so coarse as GR5",
        1.5, 0.4, [
            dead1h(0.004591368227731864, 2200, 9000),
            curableHerb(0.15610651974288337, 2000, 9000),
        ],
    ),
    model( 107, "gr7", "Scott & Burgan 2005", "High load, dry climate grass",
        "High load, continuous dry climate grass, grass is about 3 feet high",
        3, 0.15, [
            dead1h(0.04591368227731864, 2000, 8000),
            curableHerb(0.24793388429752067, 1800, 8000),
        ],
    ),
    model( 108, "gr8", "Scott & Burgan 2005", "High load, very coarse, humid climate grass",
        "High load, very coarse, continuous, humid climate grass, spread rate and flame length may be extreme if grass is fully cured",
        4, 0.3, [
            dead1h(0.02295684113865932, 1500, 8000),
            dead10h(0.0459139),
            curableHerb(0.33516988062442604, 1300, 8000),
        ],
    ),
    model( 109, "gr9", "Scott & Burgan 2005", "Very high load, humid climate grass",
        "Very high load, dense, tall, humid climate grass, about 6 feet tall, spread rate and flame length can be extreme if grass is fully cured",
        5, 0.4, [
            dead1h(0.04591368227731864, 1800, 8000),
            dead10h(0.04591368227731864),
            curableHerb(0.4132231404958677, 1600, 8000),
        ],
    ),
    model( 121, "gs1", "Scott & Burgan 2005", "Low load, dry climate grass-shrub",
        "Low load, dry climate grass-shrub shrub about 1 foot high, grass load low, spread rate moderate and flame length low",
        0.9, 0.15, [
            dead1h(0.009182736455463728, 2000, 8000),
            curableHerb(0.02295684113865932, 1800, 8000),
            liveStem(0.02984403, 1800),
        ],
    ),
    model( 122, "gs2", "Scott & Burgan 2005", "Moderate load, dry climate grass-shrub",
        "Moderate load, dry climate grass-shrub, shrubs are 1-3 feet high, grass load moderate, spread rate high, and flame length is moderate",
        1.5, 0.15, [
            dead1h(0.02295684113865932, 2000, 8000),
            dead10h(0.02295684113865932),
            curableHerb(0.027548209366391182, 1800, 8000),
            liveStem(0.04591368227731864, 1800),
        ],
    ),
    model( 123, "gs3", "Scott & Burgan 2005", "Moderate load, humid climate grass-shrub",
        "Moderate load, humid climate grass-shrub, moderate grass/shrub load, grass/shrub depth is less than 2 feet, spread rate is high and flame length is moderate",
        1.8, 0.4, [
            dead1h(0.013774104683195591, 1800, 8000),
            dead10h(0.01147842056932966),
            curableHerb(0.06657483930211203, 1600, 8000),
            liveStem(0.057392102846648294, 1600),
        ],
    ),
    model( 124, "gs4", "Scott & Burgan 2005", "High load, humid climate grass-shrub",
        "High load, humid climate grass-shrub, heavy grass/shrub load, depth is greater than 2 feet, spread rate is high and flame length very high",
        2.1, 0.4, [
            dead1h(0.0872359963269054, 1800, 8000),
            dead10h(0.013774104683195591),
            dead100h(0.004591368227731864),
            curableHerb(0.15610651974288337, 1600, 8000),
            liveStem(0.3259871441689623, 1600),
        ],
    ),
    model( 141, "sh1", "Scott & Burgan 2005", "Low load, dry climate shrub",
        "Low load dry climate shrub, woody shrubs and shrub litter, fuelbed depth about 1 foot, may be some grass, spread rate and flame low",
        1, 0.15, [
            dead1h(0.01147842056932966, 2000, 8000),
            dead10h(0.01147842056932966),
            curableHerb(0.0068870523415977955, 1800, 8000),
            liveStem(0.05968778696051423, 1600),
        ],
    ),
    model( 142, "sh2", "Scott & Burgan 2005", "Moderate load, dry climate shrub",
        "Moderate load dry climate shrub, woody shrubs and shrub litter, fuelbed depth about 1 foot, no grass, spread rate and flame low",
        1, 0.15, [
            dead1h(0.06198347107438017, 2000, 8000),
            dead10h(0.11019283746556473),
            dead100h(0.03443526170798898),
            liveStem(0.17676767676767677, 1600),
        ],
    ),
    model( 143, "sh3", "Scott & Burgan 2005", "Moderate load, humid climate shrub",
        "Moderate load, humid climate shrub, woody shrubs and shrub litter, possible pine overstory, fuelbed depth 2-3 feet, spread rate and flame low",
        2.4, 0.4, [
            dead1h(0.02066115702479339, 1600, 8000),
            dead10h(0.13774104683195593),
            liveStem(0.28466483011937554, 1400),
        ],
    ),
    model( 144, "sh4", "Scott & Burgan 2005", "Low load, humid climate timber-shrub",
        "Low load, humid climate timber shrub, woody shrubs and shrub litter, low to moderate load, possible pine overstory, fuelbed depth about 3 feet, spread rate high and flame moderate",
        3, 0.3, [
            dead1h(0.03902662993572084, 2000, 8000),
            dead10h(0.05280073461891643),
            dead100h(0.009182736455463728),
            liveStem(0.11707988980716252, 1600),
        ],
    ),
    model( 145, "sh5", "Scott & Burgan 2005", "High load, dry climate shrub",
        "High load, dry climate shrub litter and woody shrubs, heavy load with depth 4-6 feet, spread rate and flame very high, moisture extinction high",
        6, 0.15, [
            dead1h(0.1652892561983471, 750, 8000),
            dead10h(0.09641873278236915),
            liveStem(0.13314967860422405, 1600),
        ],
    ),
    model( 146, "sh6", "Scott & Burgan 2005", "Low load, humid climate shrub",
        "Low load, humid climate shrub, woody shrubs and shrub litter, dense shrubs, little or no herbaceous fuel, depth about 2 feet, spread rate and flame high",
        2, 0.3, [
            dead1h(0.13314967860422405, 750, 8000),
            dead10h(0.06657483930211203),
            liveStem(0.06427915518824609, 1600),
        ],
    ),
    model( 147, "sh7", "Scott & Burgan 2005", "Very high load, dry climate shrub",
        "Very high load, dry climate shrub, woody shrubs and shrub litter, very heavy shrub load, depth 4-6 feet, spread rate somewhat lower than SH6 and flame very high",
        6, 0.15, [
            dead1h(0.16069788797061524, 750, 8000),
            dead10h(0.24334251606978877),
            dead100h(0.10101010101010101),
            liveStem(0.15610651974288337, 1600),
        ],
    ),
    model( 148, "sh8", "Scott & Burgan 2005", "High load, humid climate shrub",
        "High load, humid climate shrub, woody shrubs and shrub litter, dense shrubs, little or no herbaceous fuel, depth about 3 feet, spread rate and flame high",
        3, 0.4, [
            dead1h(0.0941230486685032, 750, 8000),
            dead10h(0.15610651974288337),
            dead100h(0.03902662993572084),
            liveStem(0.19972451790633605, 1600),
        ],
    ),
    model( 149, "sh9", "Scott & Burgan 2005", "Very high load, humid climate shrub",
        "Very high load, humid climate shrub, woody shrubs and shrub litter, dense finely branched shrubs with fine dead fuel, 4-6 feet tall, herbaceous may be present, spread rate and flame high",
        4.4, 0.4, [
            dead1h(0.20661157024793386, 750, 8000),
            dead10h(0.11248852157943066),
            curableHerb(0.07116620752984389, 1800, 8000),
            liveStem(0.3213957759412305, 1500),
        ],
    ),
    model( 161, "tu1", "Scott & Burgan 2005", "Light load, dry climate timber-grass-shrub",
        "Low load dry climate timber grass shrub, low load of grass and/or shrub with litter, spread rate and flame low",
        0.6, 0.2, [
            dead1h(0.009182736455463728, 2000, 8000),
            dead10h(0.04132231404958678),
            dead100h(0.06887052341597796),
            curableHerb(0.009182736455463728, 1800, 8000),
            liveStem(0.04132231404958678, 1600),
        ],
    ),
    model( 162, "tu2", "Scott & Burgan 2005", "Moderate load, humid climate timber-shrub",
        "Moderate load, humid climate timber-shrub, moderate litter load with some shrub, spread rate moderate and flame low",
        1, 0.3, [
            dead1h(0.0436179981634527, 2000, 8000),
            dead10h(0.08264462809917356),
            dead100h(0.057392102846648294),
            liveStem(0.009182736455463728, 1600),
        ],
    ),
    model( 163, "tu3", "Scott & Burgan 2005", "Moderate load, humid climate timber-grass-shrub",
        "Moderate load, humid climate timber grass shrub, moderate forest litter with some grass and shrub, spread rate high and flame moderate",
        1.3, 0.3, [
            dead1h(0.050505050505050504, 1800, 8000),
            dead10h(0.0068870523415977955),
            dead100h(0.01147842056932966),
            curableHerb(0.029843893480257115, 1600, 8000),
            liveStem(0.050505050505050504, 1400),
        ],
    ),
    model( 164, "tu4", "Scott & Burgan 2005", "Dwarf conifer understory",
        "Dwarf conifer with understory, short conifer trees with grass or moss understory, spread rate and flame moderate",
        0.5, 0.12, [
            dead1h(0.20661157024793386, 2300, 8000),
            liveStem(0.09182736455463728, 2000),
        ],
    ),
    model( 165, "tu5", "Scott & Burgan 2005", "Very high load, dry climate timber-shrub",
        "Very high load, dry climate timber shrub, heavy forest litter with shrub or small tree understory, spread rate and flame moderate",
        1, 0.25, [
            dead1h(0.18365472910927455, 1500, 8000),
            dead10h(0.18365472910927455),
            dead100h(0.13774104683195593),
            liveStem(0.13774104683195593, 750),
        ],
    ),
    model( 181, "tl1", "Scott & Burgan 2005", "Low load, compact conifer litter",
        "Low load compact conifer litter, compact forest litter, light to moderate load, 1-2 inches deep, may represent a recent burn, spread rate and flame low",
        0.2, 0.3, [
            dead1h(0.04591368227731864, 2000, 8000),
            dead10h(0.10101010101010101),
            dead100h(0.1652892561983471),
        ],
    ),
    model( 182, "tl2", "Scott & Burgan 2005", "Low load broadleaf litter",
        "Low load broadleaf litter, broadleaf, hardwood litter, spread rate and flame low",
        0.2, 0.25, [
            dead1h(0.06427915518824609, 2000, 8000),
            dead10h(0.10560146923783285),
            dead100h(0.10101010101010101),
        ],
    ),
    model( 183, "tl3", "Scott & Burgan 2005", "Moderate load conifer litter",
        "Moderate load conifer litter, moderate load conifer litter, light load of coarse fuels, spread rate is very low and flame low",
        0.3, 0.2, [
            dead1h(0.02295684113865932, 2000, 8000),
            dead10h(0.10101010101010101),
            dead100h(0.12855831037649218),
        ],
    ),
    model( 184, "tl4", "Scott & Burgan 2005", "Small downed logs",
        "Small downed logs moderate load of fine litter and coarse fuels, small diameter downed logs, spread rate and flame low",
        0.4, 0.25, [
            dead1h(0.02295684113865932, 2000, 8000),
            dead10h(0.06887052341597796),
            dead100h(0.1928374655647383),
        ],
    ),
    model( 185, "tl5", "Scott & Burgan 2005", "High load conifer litter",
        "High load conifer litter, light slash or dead fuel, spread rate and flame low",
        0.6, 0.25, [
            dead1h(0.05280073461891643, 2000, 8000),
            dead10h(0.11478420569329659),
            dead100h(0.20202020202020202),
        ],
    ),
    model( 186, "tl6", "Scott & Burgan 2005", "High load broadleaf litter",
        "Moderate load broadleaf litter, spread rate and flame moderate",
        0.3, 0.25, [
            dead1h(0.11019283746556473, 2000, 8000),
            dead10h(0.055096418732782364),
            dead100h(0.055096418732782364),
        ],
    ),
    model( 187, "tl7", "Scott & Burgan 2005", "Large downed logs",
        "Large downed logs, heavy load forest litter, larger diameter downed logs, spread rate and flame low",
        0.4, 0.25, [
            dead1h(0.013774104683195591, 2000, 8000),
            dead10h(0.06427915518824609),
            dead100h(0.371900826446281),
        ],
    ),
    model( 188, "tl8", "Scott & Burgan 2005", "Long-needle litter",
        "Long needle litter, moderate load long needle pine litter, may have small amounts of herbaceous fuel, spread rate moderate and flame low",
        0.3, 0.35, [
            dead1h(0.2662993572084481, 1800, 8000),
            dead10h(0.06427915518824609),
            dead100h(0.050505050505050504),
        ],
    ),
    model( 189, "tl9", "Scott & Burgan 2005", "Very high load broadleaf litter",
        "Very high load broadleaf litter, may be heavy needle drape, spread rate and flame moderate",
        0.6, 0.35, [
            dead1h(0.305325987144169, 1800, 8000),
            dead10h(0.1515151515151515),
            dead100h(0.19054178145087236),
        ],
    ),
    model( 201, "sb1", "Scott & Burgan 2005", "Low load activity fuel",
        "Low load activity fuel, light dead and down activity fuel, fine fuel is 10-20 t/ac, 1-3 inches in diameter, depth < 1 foot, spread rate moderate and flame low",
        1, 0.25, [
            dead1h(0.06887052341597796, 2000, 8000),
            dead10h(0.13774104683195593),
            dead100h(0.505050505050505),
        ],
    ),
    model( 202, "sb2", "Scott & Burgan 2005", "Moderate load activity or low load blowdown",
        "Moderate load activity fuel or low load blowdown, 7-12 t/ac, 0-3 inch diameter class, depth about 1 foot, blowdown scattered with many still standing, spread rate moderate and flame low",
        1, 0.25, [
            dead1h(0.20661157024793386, 2000, 8000),
            dead10h(0.1951331496786042),
            dead100h(0.18365472910927455),
        ],
    ),
    model( 203, "sb3", "Scott & Burgan 2005", "High load activity fuel or moderate load blowdown",
        "High load activity fuel or moderate load blowdown, heavy dead down activity fuel or moderate blowdown, 7-12 t/ac, 0-.25 inch diameter class, depth > 1 foot, blowdown moderate trees compacted to near the ground, spread rate and flame high",
        1.2, 0.25, [
            dead1h(0.2525252525252525, 2000, 8000),
            dead10h(0.12626262626262624),
            dead100h(0.13774104683195593),
        ],
    ),
    model( 204, "sb4", "Scott & Burgan 2005", "High load blowdown",
        "High load blowdown, heavy blowdown fuel, blowdown is total fuelbed not compacted, foliage and fine fuel still attached to blowdown, spread rate and flame very high ",
        2.7, 0.25, [
            dead1h(0.24104683195592286, 2000, 8000),
            dead10h(0.16069788797061524),
            dead100h(0.24104683195592286),
        ],
    ),
    model( 301, "crown", "CROWN", "Crown canopy fuel",
        "Crown canopy fuel model used by Rothermel`s crown fire spread rate model.",
        1, 0.25, [
            dead1h(0.138, 2000, 8000),
            dead10h(0.092),
            dead100h(0.23),
            liveStem(0.092, 1500),
        ],
    ),
]
