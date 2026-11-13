/*
The concepthere is that every input parameter is also a 'model', which may be client input
or derived from other inputs.
*/
export const moduleChain = [
    'customFuelModels',     // custom fuels file name
    'fuelModelCatalog',     // new FuelModelCatalog(customFuelModels)

    'fuelKey',              // input
    'fuelModel',            // fuelModel.update(fuelKey)

    'curableHerbMoisture',  // input if curedHerbEstimated
    'curedHerb',            // input or fn(curableHerbMoisture)
    'fuelBed',              // fuelBed.update()

    'liveCategoryMoisture', // input if liveMoistureByCategory
    'liveStemMoisture',     // input or fn(liveCategoryMoisture)
    'liveHerbMoisture',     // input or fn(liveCategoryMoisture)
    
    'deadCategoryMoisture', // input if deadMoistureByCategory
    'dead100hMoisture',     // input or fn(deadCategoryMoisture)
    'dead10hMoisture',      // input or fn(deadCategoryMoisture)
    'dead1hMoisture',       // input or fn(deadCategoryMoisture)
    'fuelIgnition',         // fuelIgnition.update()

    'canopyHeight',         // input
    'canopyBaseHeight',     // input
    'canopyCover',          // input
    'canopyBulkDensity',    // input
    'fuelCanopy',           // fuelCanopy.update()

    'windSpeedReduction',   // input or fn(fuelCanopy, fuelModel)

    'windSpeed20ft',        // input or fn(windSpeed10m)
    'windspeed10m',         // input or fn(windSpeed20ft)
    'midflameWindSpeed',    // input or fn(windSpeed20ft, windSpeedReduction)
    'windSource',           // input or fn(windBearing)
    'windBearing',          // input or fn(windSource)

    'aspect',               // input or fn(upslope)
    'upslope',              // input or fn(aspect)
    'slopeDegrees',         // input or fn(slopeRatio)
    'slopeRatio',           // input or fn(slopeDegrees)

    'fireBehavior',         // fireBehavior.update()

    // if linked to fireSize
    'headingSpreadRate',    // input or fireBehavior.headingSpreadRate
    'headingFromNorth',     // input or fireBehavior.headingFromNorth
    'flameLength',          // input or fireBehavior.flameLength
    'lengthWidthRatio',     // input or fireBehavior.lengthWidthRatio

    'fireShape',            // fireShape.update({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})

    'elapsedTime',          // input
    'ignEast',              // input
    'ignNorth',             // input
    'fireSize',             // fireSize.update({fireShape, elapsedTime, ignEast. ignNorth})

    'headFireVector',       // fn(fireSize)
    'backFireVector',       // fn(fireSize)

    'betaFromHead',         // input
    'betaFireVector',       // fn({fireSize, betaFromHead})
    'beta6FireVector',      // fn({fireSize, betaFromHead})

    'psiFromHead',         // input
    'psiFireVector',       // fn({fireSize, betaFromHead})
]