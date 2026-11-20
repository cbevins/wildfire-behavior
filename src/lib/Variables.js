// an eclectic collection of various attempts

export const FuelModelInputs = [

        {key: 'depth', desc: 'Fuel bed depth',
            initialValue: 1, type: 'quantity', units: 'ft'},
        {key: 'deadMext', desc: 'Dead fuel extinction moisture content',
            initialValue: 0.15, type: 'ratio', min: 0},
        {key: 'particles', desc: 'FuelParticle array',
            initialValue: [], type: 'array'},
        // CAUTION: there is no validation of FuelParticles objects
    ]
export const FuelModelProcessorInputs = [
        {key: 'fuelKey', desc: 'FuelModel number or alpha key',
            initialValue: '', type: 'string'},
        ]

export const FuelBedInputs = [
        {key: 'fuelModel', desc: 'FuelModel object',
            value: null, type: 'FuelModel', order: 1, required: true},
    ]

export const FireBehaviorInputs = [
        {key: 'fuelIgnition', desc: 'FuelIgnition object',
            value: null, type: 'FuelIgnition', order: 1},
        {key: 'midflameWindSpeed', desc: 'Wind speed at midflame height',
            value: 0, type: 'quantity', units: 'ft/min', min: 0, max: 40*88, order: 1},
        {key: 'windBearing', desc: 'Wind heading direction, degrees clockwise from north',
            value: 0, type: 'quantity', units: 'degrees', min: 0, max: 360, order: 1},
        {key: 'aspect', desc: 'Terrain aspect (down-slope direction), degrees clockwise from north',
            value: 0, type: 'quantity', units: 'degrees', order: 1},
        {key: 'slopeRatio', desc: 'Terrain slope steepness ratio of vertical rise to horizontal reach',
            value: 0, type: 'ratio', min: 0, max: 58, order: 1},    // tan(89deg) = 57.2
        {key: 'limitSpreadRateByReactionIntensity', desc: 'Apply Rothermels spread rate limit based on wind/fire energy ratio',
            value: true, type: 'boolean', order: 1},
        {key: 'limitSpreadRateByEffWindSpeed', desc: 'Apply Andrews spread rate limit based on effective wind speed',
            value: false, type: 'boolean', order: 1},
    ]
export const FireBehaviorProcessorInputs = [
        {key: 'midflameWindSpeed', desc: 'Wind speed at midflame height',
            value: 0, type: 'quantity', units: 'ft/min', min: 0, max: 40*88, order: 1},
        {key: 'windBearing', desc: 'Wind heading direction, degrees clockwise from north',
            value: 0, type: 'quantity', units: 'degrees', min: 0, max: 360, order: 1},
        {key: 'aspect', desc: 'Terrain aspect (down-slope direction), degrees clockwise from north',
            value: 0, type: 'quantity', units: 'degrees', order: 1},
        {key: 'slopeRatio', desc: 'Terrain slope steepness ratio of vertical rise to horizontal reach',
            value: 0, type: 'ratio', min: 0, max: 58, order: 1},    // tan(89deg) = 57.2
        {key: 'limitSpreadRateByReactionIntensity', desc: 'Apply Rothermels spread rate limit based on wind/fire energy ratio',
            value: true, type: 'boolean', order: 1},
        {key: 'limitSpreadRateByEffWindSpeed', desc: 'Apply Andrews spread rate limit based on effective wind speed',
            value: false, type: 'boolean', order: 1},

        {key: 'noWindSpreadRate'},
        {key: 'reactionIntensity'},
        {key: 'slopeK'},
        {key: 'windB'},
        {key: 'windI'},
        {key: 'windK'},
        {key: 'residenceTime'},
    ]

export const FuelIgnitionInputs = [
        {key: 'fuelBed', desc: 'FuelBed object',
            value: null, type: 'FuelBed', order: 1},
        {key: 'moistureDead1h', desc: 'Dead 1-h time-lag fuel moisture content',
            value: 0.1, type: 'ratio', min: 0, max: 9, order: 1},
        {key: 'moistureDead10h', desc: 'Dead 10-h time-lag fuel moisture content',
            value: 0.1, type: 'ratio', min: 0, max: 9, order: 1},
        {key: 'moistureDead100h', desc: 'Dead 100-h time-lag fuel moisture content',
            value: 0.1, type: 'ratio', min: 0, max: 9, order: 1},
        {key: 'moistureLiveHerb', desc: 'Live herbaceous fuel moisture content',
            value: 5, type: 'ratio', min: 0, max: 9, order: 1},
        {key: 'moistureLiveStem', desc: 'Live stem, woody fuel moisture content',
            value: 5, type: 'ratio', min: 0, max: 9, order: 1},
    ]

export const FuelIgnitionProcessorInputs = [
        {key: 'dead', desc: 'FuelBedProcessor.dead object',
            initialValue: null, type: 'FuelBedProcessor'},
        {key: 'live', desc: 'FuelBedProcessor.live object',
            initialValue: null, type: 'FuelBedProcessor'},

        {key: 'bulkDensity'},
        {key: 'propagatingFluxRatio'},
        {key: 'moistureDead1h', desc: 'Dead 1-h time-lag fuel moisture content',
            initialValue: 0.1, type: 'ratio', min: 0, max: 9},
        {key: 'moistureDead10h', desc: 'Dead 10-h time-lag fuel moisture content',
            initialValue: 0.1, type: 'ratio', min: 0, max: 9},
        {key: 'moistureDead100h', desc: 'Dead 100-h time-lag fuel moisture content',
            initialValue: 0.1, type: 'ratio', min: 0, max: 9},
        {key: 'moistureLiveHerb', desc: 'Live herbaceous fuel moisture content',
            initialValue: 5, type: 'ratio', min: 0, max: 9},
        {key: 'moistureLiveStem', desc: 'Live stem, woody fuel moisture content',
            initialValue: 5, type: 'ratio', min: 0, max: 9},
    ]



export const FireEllipseInputs = [
        // updateFireEllipse() is invoked whenever one of these are specified in inputs object
        // (both of these (and flameLength) are also present in FireBehavior instances)
        {key: 'headingSpreadRate', desc: 'Maximum fire spread rate',
            value: 0, type: 'quantity', units: 'ft/min', min: 0, order: 1},
        {key: 'lengthWidthRatio', desc: 'Fire ellipse length-to-width ratio',
            value: 1, type: 'ratio', min: 1, order: 1},
        {key: 'flameLength', desc: 'Flame length',
            value: 0, type: 'quantity', units: 'ft', order: 1},

        // updateElapsedTime() is invoked whenever 'elapsedTime' is specified in 'inputs' object:
        {key: 'elapsedTime', desc: 'Elapsed time since ignition',
            value: 0, type: 'quantity', units: 'min', min: 0, order: 2},

        // updatePosition() is invoked whenever one or more of these are specified in 'inputs' object:
        {key: 'bearing', desc: 'Head fire bearing in degrees clockwie from north',
            value: 0, type: 'quantity', units: 'degrees', min: 0, max: 360, order: 3},
        {key: 'ignEast', desc: 'Ignition point false easting (Projected Coordinate System)',
            value: 0, type: 'quantity', units: 'ft', order: 3},
        {key: 'ignNorth',  desc: 'Ignition point false northing (Projected Coordinate System)',
            value: 0, type: 'quantity', units: 'ft', order: 3},
        {key: 'ignX', desc: 'Ignition point Cartesian x (normally left to 0)',
            value: 0, type: 'quantity', units: 'ft', order: 3},       
        {key: 'ignY', desc: 'Ignition point Cartesian y (normally left to 0)',
            value: 0, type: 'quantity', units: 'ft', order: 3},       
    ]

export const FireEllipseOutputs = [
        {key: 'area', desc: 'Fire ellipse area',
            type: 'quantity', units: 'ft2'},
        {key: 'backingDistance', desc: 'Fire ellipse ignition point to back distance',
            type: 'quantity', units: 'ft'},
        {key: 'backingSpreadRate', desc: 'Fire ellipse backing fire spread rate',
            type: 'quantity', units: 'ft/min'},
        {key: 'centerE', desc: 'Fire ellipse center false easting (projected coordinate system)',
            type: 'quantity', units: 'ft'},
        {key: 'centerN', desc: 'Fire ellipse center false northing (projected coordinate system)',
            type: 'quantity', units: 'ft'},
        {key: 'centerX', desc: 'Fire ellipse center x-coordinate (local coordinate system)',
            type: 'quantity', units: 'ft'},
        {key: 'centerY', desc: 'Fire ellipse center y-coordinate (local coordinate system)',
            type: 'quantity', units: 'ft'},
        {key: 'eccentricity', desc: 'Fire ellipse eccentricity',
            type: 'ratio', units: 'dl'},
        {key: 'effectiveWindSpeed', desc: 'Fire ellipse effective wind speed (from length/width)',
            type: 'quantity', units: 'ft/min'},
        {key: 'firelineIntensity', desc: 'Fire ellipse heading fireline intensity',
            type: 'quantity', units: 'BTU/ft/s'},
        {key: 'fDistance', desc: 'Fire ellipse major semi-axis length',
            type: 'quantity', units: 'ft'},
        {key: 'fSpreadRate', desc: 'Fire ellipse major semi-axis expansion rate',
            type: 'quantity', units: 'ft/min'},
        {key: 'heatPerUnitArea', desc: 'Fire ellipse heat per unit area during passage of fire front',
            type: 'quantity', units: 'Btu/ft2'},
        {key: 'headingDistance', desc: 'Fire ellipse ignition point to head distance',
            type: 'quantity', units: 'ft'},
        {key: 'hDistance', desc: 'Fire ellipse minor semi-axis length',
            type: 'quantity', units: 'ft'},
        // NOTE that headingSpreadRate is an input property
        {key: 'hSpreadRate', desc: 'Fire ellipse minor semi-axis expamsion rate',
            type: 'quantity', units: 'ft/min'},
        {key: 'gDistance', desc: 'Fire ellipse ignition point to center distance',
            type: 'quantity', units: 'ft'},
        {key: 'gSpreadRate', desc: 'Fire ellipse center expansion rate from ignition point',
            type: 'quantity', units: 'ft/min'},
        {key: 'latusRectumDistance', desc: 'Fire ellipse latus rectum length (normal to ignition point)',
            type: 'quantity', units: 'ft'},
        {key: 'latusRectumSpreadRate', desc: 'Fire ellipse latus rectum expansion rate (normal to ignition point)',
            type: 'quantity', units: 'ft/min'},
        {key: 'length', desc: 'Fire ellipse total length',
            type: 'quantity', units: 'ft'},
        {key: 'majorExpansionRate', desc: 'Fire ellipse major axis expansion rate',
            type: 'quantity', units: 'ft/min'},
        {key: 'minorExpansionRate', desc: 'Fire ellipse minor axis expansion rate',
            type: 'quantity', units: 'ft/min'},
        {key: 'rotationDeg', desc: 'Fire ellipse rotation counter-clockwise from Cartesian x-axis',
            type: 'quantity', units: 'deg'},
        {key: 'rotationRad', desc: 'Fire ellipse rotation counter-clockwise from Cartesian x-axis',
            type: 'quantity', units: 'radians'},
        {key: 'rotationCos', desc: 'Cosine of the fire ellipse rotation counter-clockwise from Cartesian x-axis',
            type: 'fraction', units: 'cos'},
        {key: 'rotationSin', desc: 'Sine of the fire ellipse rotation counter-clockwise from Cartesian x-axis',
            type: 'fraction', units: 'sin'},
        {key: 'width', desc: 'Fire ellipse total width',
            type: 'quantity', units: 'ft'},
    ]
export const BehavePlusProps = {

    // WfsFuelCuring
    curedHerb: {
        owner: 'fuelCuring',
        key: 'curedHerb',
        label: 'Cured Herb Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0],
    },

    // WfsFuelKeys
    fuelCover1: {
        owner: 'fuelKeys',
        key: 'fuelCover1',
        label: 'Primary Fuel Model Coverage Fraction',
        module: 'surface',
        type: 'fraction',
        values: [1],
    },
    fuelKey1: {
        owner: 'fuelKeys',
        key: 'fuelKey1',
        label: 'Primary Fuel Model Key',
        module: 'surface',
        type: 'fuelModelKey',
        output: false,
        values: [1],
    },
    fuelKey2: {
        owner: 'fuelKeys',
        key: 'fuelKey2',
        label: 'Secondary Fuel Model Key',
        module: 'surface',
        type: 'fuelModelKey',
        values: [1]},

    // WfsFuelMoisture
    moistureDead1h: {
        owner: 'fuelMoisture',
        key: 'moistureDead1h',
        label: 'Dead 1-h Fuel Particle Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0.05],
    },
    moistureDead10h: {
        owner: 'fuelMoisture',
        key: 'moistureDead10h',
        label: 'Dead 10-h Fuel Particle Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0.07],
    },
    moistureDead100h: {
        owner: 'fuelMoisture',
        key: 'moistureDead100h',
        label: 'Dead 100-hFuel Particle Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0.09],
    },
    moistureLiveHerb: {
        owner: 'fuelMoisture',
        key: 'moistureLiveHerb',
        label: 'Live Herb Fuel Particle Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0.5],
    },
    moistureLiveStem: {
        owner: 'fuelMoisture',
        key: 'moistureLiveStem',
        label: 'Live Stem Fuel Particle Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [1.5],
    },
    moistureDeadFuels: {
        owner: 'fuelMoisture',
        key: 'moistureDeadFuels',
        label: 'Dead Fuels Category Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [0.1],
    },
    moistureLiveFuels: {
        owner: 'fuelMoisture',
        key: 'moistureLiveFuels',
        label: 'Live Fuels Category Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [3],
    },
    moistureLiveCurable: {
        owner: 'fuelMoisture',
        key: 'moistureLiveCurable',
        label: 'Live Curable Fuel Moisture Fraction',
        module: 'surface',
        type: 'fuelMoisture',
        values: [3],
    },
    
    // WfsFireTerrain
    aspect: {
        owner: 'fireTerrain',
        key: 'aspect',
        label: 'Aspect',
        module: 'surface',
        type: 'compassDegrees',
        values: [180],
    },
    elevation: {
        owner: 'fireTerrain',
        key: 'elevation',
        label: 'Elevation',
        module: 'spotting',
        type: 'elevation',
        values: [0],
    },
    ridgeValleyDistance: {
        owner: 'fireTerrain',
        key: 'ridgeValleyDistance',
        label: 'Ridge-to-valley Distance',
        module: 'spotting',
        type: 'fireDistance',
        values: [0],
    },
    ridgeValleyElevation: {
        owner: 'fireTerrain',
        key: 'ridgeValleyElevation',
        label: 'Ridge-to-valley Elevation',
        module: 'spotting',
        type: 'elevation',
        values:[0]
    },
    slopeDegrees: {
        owner: 'fireTerrain',
        key: 'slopeDegrees',
        label: 'Slope Degrees',
        module: 'surface',
        type: 'verticalDegrees',
        values: [0],
    },
    slopeRatio: {
        owner: 'fireTerrain',
        key: 'slopeRatio',
        label: 'Slope Rise/Reach',
        module: 'surface',
        type: 'ratio',
        values: [0.25],
    },
    topography: {
        owner: 'fireTerrain',
        key: 'topography',
        label: 'Location Topography',
        module: 'spotting',
        type: 'topography',
        values: ['ridgetop'],
    },
    upslope: {
        owner: 'fireTerrain',
        key: 'upslope',
        label: 'Upslope Direction from North',
        module: 'surface',
        type: 'compassDegrees',
        values: [0],
    },
    // fuelIgnition
    noWindSpreadRate: {
        owner: 'fuelIgnition',
        key: 'noWindSpreadRate',
        label: 'No-wind, No-slope Fire Spread Rate',
        module: 'surface',
        type: 'fireSpreadRate',
        values: [0],
    }
}

