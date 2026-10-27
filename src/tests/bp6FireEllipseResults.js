/**
 * Adapted from fire-behavior-simulator/src/dag/_behave_tests_/fireEllipse.bp6.resutsl.js
 * 
 * SurfaceFire test data for the following scenario:
 * - Weighted Behave fuel models '10' (60%) and '124' (40%)
 * - Covers surface.primary.*, surface.secondary.*, and surface.weighted.*
 */
import { SurfaceFireEquations as SurfaceFire } from '../core.js'

export const ConfigsDEP = [
  ['configure.fire.effectiveWindSpeedLimit', ['applied', 'ignored'][0]],
  
  ['configure.fire.firelineIntensity', ['firelineIntensity', 'flameLength'][0]],
  // Config.firelineIntensity.value = Config.firelineIntensity.fli
  
  ['configure.fire.lengthToWidthRatio', ['lengthToWidthRatio', 'effectiveWindSpeed'][0]],
  
  ['configure.fire.weightingMethod', ['arithmetic', 'expected', 'harmonic'][0]],
  // Config.surfaceFire.value = Config.surfaceFire.onefuel
  
  ['configure.fire.vector', ['fromHead', 'fromUpslope', 'fromNorth'][2]],
  // Config.fireVectors.value = Config.fireVectors.fromNorth
  
  ['configure.fuel.chaparralTotalLoad', ['input', 'estimated'][0]],
  
  ['configure.fuel.curedHerbFraction', ['input', 'estimated'][1]],
  // Config.fuelCuring.value = Config.fuelCuring.estimated

  ['configure.fuel.moisture', ['individual', 'liveCategory', 'category', 'catalog'][0]],

  ['configure.fuel.primary', ['catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'][0]],

  ['configure.fuel.secondary', ['none', 'catalog', 'behave', 'chaparral', 'palmettoGallberry', 'westernAspen'][0]],

  ['configure.fuel.windSpeedAdjustmentFactor', ['input', 'estimated'][0]],

  ['configure.slope.steepness', ['ratio', 'degrees', 'map'][0]],

  ['configure.wind.direction', ['sourceFromNorth', 'headingFromUpslope', 'upslope'][0]],
  // Config.windDirection.value = Config.windDirection.originWrtNo
  
  ['configure.wind.speed', ['at10m', 'at20ft', 'atMidflame'][2]],
  // Config.midflameWindSpeed.value = Config.midflameWindSpeed.input

  ['link.crownFire', 'linkedToSurfaceFire'],
  ['link.crownSpot', 'linkedToCrownFire'],
  ['link.fireContain', 'linkedToFireEllipse'],
  ['link.fireEllipse', 'linkedToSurfaceFire'],
  ['link.scorchHeight', 'linkedToSurfaceFire'],
  ['link.surfaceSpot', 'linkedToSurfaceFire'],
  ['link.treeMortality', 'linkedToScorchHeight']
]

// Fixed input values used in results computations
const airTemp = 95
const elapsed = 60
const mapScale = 24000
const midflame = 880

export const Inputs = [
  ['site.fire.time.sinceIgnition', [elapsed]],
  ['site.fire.vector.fromNorth', [45]],
  ['site.map.scale', [mapScale]],
  ['site.moisture.dead.tl1h', [0.05]],
  ['site.moisture.dead.tl10h', [0.07]],
  ['site.moisture.dead.tl100h', [0.09]],
  ['site.moisture.dead.category', [0.05]],
  ['site.moisture.live.herb', [0.5]],
  ['site.moisture.live.stem', [1.5]],
  ['site.moisture.live.category', [1.5]],
  ['site.slope.direction.aspect', [180]],
  ['site.slope.steepness.ratio', [0.25]],
  ['site.temperature.air', [airTemp]],
  ['site.terrain.spotSourceLocation', ['ridgeTop']],
  ['site.terrain.ridgeValleyDistance', [5000]],
  ['site.terrain.ridgeValleyElevation', [1000]],
  ['site.wind.direction.source.fromNorth', [270]],
  ['site.windSpeedAdjustmentFactor', [0.5]],
  ['site.wind.speed.atMidflame', [midflame]],
  ['surface.primary.fuel.model.catalogKey', ['10']],
  ['surface.secondary.fuel.model.catalogKey', ['124']],
  ['surface.weighted.fire.primaryCover', [0.6]]
]
// beta.fli = head.fli * beta5.ros / head.ros
const beta5fli010 = (389.95413667947145 * 2.6256648650882601) / 18.551680325448835
const beta5fl010 = 0.45 * Math.pow(beta5fli010, 0.46)
const beta5scht010 = SurfaceFire.scorchHeight(beta5fli010, midflame, airTemp)

// beta.fli = head.fli * beta5.ros / head.ros 
const beta5fli124 = (2467.9286450361865 * 6.8494531181657319) / 48.47042599399056
const beta5fl124 = 0.45 * Math.pow(beta5fli124, 0.46)
const beta5scht124 = SurfaceFire.scorchHeight(beta5fli124, midflame, airTemp)

const m = mapScale
const m2 = m * m

const e = 'surface.fire.ellipse.'
export const FireEllipseBp6Results = {   // array value are for fuel keys ['10', '124']
  fuels: ['10', '124'],
  axis: {
    eccentricity: [0.95835298387126711, 0.95835332217217739],
    lwr: [3.5015680219321221, 3.5015819412846603],
    major: {ros: [0.39452649041938642 + 18.551680325448835, 1.0307803973340242 + 48.47042599399056]},
    minor: {ros: [2 * 2.7053889424963877, 2 * 7.0684061120619655]},
    f: {ros: [9.4731034079341114, 1485.0361917397374 / elapsed]},
    g: {ros: [9.0785769175147255, 1423.189367899696 / elapsed]},
    h: {ros: [2.7053889424963877, 424.10436672371787 / elapsed]},
  },
  back: {
    dir: {
      fromHead: [180, 180],
      fromNorth: [0, 0],
      fromUpslope: [0, 0],
    },
    fireDist: [23.671589425163184, 61.846823840041452],
    flame: [1.1907414731175683, 2.7824194067294856],
    fli: [8.2929003879841954, 52.483394093499705],
    mapDist: [23.671589425163184 / mapScale, 61.846823840041452 / mapScale,],
    ros: [0.39452649041938642, 1.0307803973340242],
    scorch: [0.52018662032054752, 4.382412107193391,],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  beta5: {
    dir: {
      fromHead: [360 - 42.573367385837855, 360 - 42.613728665173383],
      fromNorth: [45, 45],
      fromUpslope: [45, 45],
    },
    fireDist: [elapsed * 2.6256648650882601, elapsed * 6.8494531181657319],
    flame: [beta5fl010, beta5fl124],
    fli: [beta5fli010, beta5fli124],
    mapDist: [(elapsed * 2.6256648650882601) / mapScale, (elapsed * 6.8494531181657319) / mapScale],
    ros: [2.6256648650882601, 6.8494531181657319],
    scorch: [beta5scht010, beta5scht124],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  beta6: {
    dir: {
      fromHead: [360 - 42.573367385837855, 360 - 42.613728665173383],
      fromNorth: [45, 45],
      fromUpslope: [45, 45],
    },
    fireDist: [elapsed * 2.6256648650882601, elapsed * 6.8494531181657319],
    flame: [1.896462213587117, 4.4296501098298906],
    fli: [22.809320529051977, 144.22374220988746],
    mapDist: [(elapsed * 2.6256648650882601) / mapScale, (elapsed * 6.8494531181657319) / mapScale],
    ros: [2.6256648650882601, 6.8494531181657319],
    scorch: [1.6814949065754006, 13.669401441568459],
    theta: [138.95912883244358, 138.998426267168],
    psi: [108.16241745554537, 108.185867694348],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  head: {
    dir: {
      fromHead: [0, 0],
      fromNorth: [0, 0],
      fromUpslope: [0, 0],
    },
    fireDist: [1113.1008195269301, 2908.2255596394334],
    fli: [389.95413667947145, 2467.9286450361865],
    flame: [6.9996889013229229, 16.35631663317114],
    mapDist: [1113.1008195269301 / mapScale, 2908.2255596394334 / mapScale],
    ros: [18.551680325448835, 48.47042599399056],
    scorch: [39.580181786322299, 215.6827714],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  left: {
    dir: {
      fromHead: [270, 270],
      fromNorth: [0, 0],
      fromUpslope: [0, 0],
    },
    fireDist: [162.32333654978328, 424.10436672371793],
    flame: [2.8870088099013929, 6.7461198324614715],
    fli: [56.866957074505869, 359.89619544220318],
    mapDist: [162.32333654978328 / mapScale, 424.10436672371793 / mapScale],
    ros: [2.7053889424963877, 7.0684061120619655],
    scorch: [4.8023644521509334, 36.440372402518008],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  map: {
    mapArea: [289850.691417 / m2, (45.422576205218135 * (66 * 660)) / m2],
    mapLength: [1136.7724089520932 / m, 2970.0723834794749 / m],
    mapPerimeter: [2476.2400999186934 / m, 6469.7282289420209 / m],
    mapWidth: [324.64667309956644 / m, 848.20873344743575 / m],
  },
  psi: {
    dir: {
      fromHead: [360 - 42.573367385837855, 360 - 42.613728665173383],
      fromNorth: [45, 45],
      fromUpslope: [45, 45],
    },
    fireDist: [elapsed * 13.8977795836636, elapsed * 36.2892704981354],
    flame: [6.12882661647451, 14.3173998471815],
    fli: [292.129690908633, 1847.71081196849],
    mapDist: [(elapsed * 13.8977795836636) / mapScale, (elapsed * 36.2892704981354) / mapScale],
    ros: [13.8977795836636, 36.2892704981354],
    scorch: [29.307635864149884, 169.80644998818718],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  right: {
    dir: {
      fromHead: [90, 90],
      fromNorth: [0, 0],
      fromUpslope: [0, 0],
    },
    fireDist: [162.32333654978328, 424.10436672371793],
    flame: [2.8870088099013929, 6.7461198324614715],
    fli: [56.866957074505869, 359.89619544220318],
    mapDist: [162.32333654978328 / mapScale, 424.10436672371793 / mapScale],
    ros: [2.7053889424963877, 7.0684061120619655],
    scorch: [4.8023644521509334, 36.440372402518008],
    t: [0, 0],
    dx: [0, 0],
    dy: [0, 0],
    x: [0, 0],
    y: [0, 0],
  },
  size: {
    area: [289850.691417, 45.422576205218135 * (66.0 * 660.0)],
    length: [1136.7724089520932, 2970.0723834794749],
    perimeter: [2476.2400999186934, 6469.7282289420209],
    width: [324.64667309956644, 848.20873344743575],
  },
  t: [0, 0],
  x: [0, 0],
  y: [0, 0],
  midflame: [midflame, midflame],
  temp: [airTemp, airTemp]
}
