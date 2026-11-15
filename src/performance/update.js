import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead, FireVectorPsi } from '#lib/index.js'
import { ParamsBp6 } from '../use-cases/Params.js'

export function fmt(v, dec=2) {
    const e = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]
    return Math.trunc(e[dec] * v) / e[dec] 
}

const params = {...ParamsBp6}
const results = []

// Get an array of all burnable fuel model keys
const catalog = new FuelModelCatalog()
const fuelKeys = []
for (let fuelKey of catalog.getNumberKeys()) {
    if (catalog.isBurnable(fuelKey)) fuelKeys.push(fuelKey)
}

// Create empty data structure
let t = performance.now()
const data = []
let n = 0
for(let i=0; i<1000; i++) {
    for(let fuelKey of fuelKeys) {
        const fuelModel = catalog.get(fuelKey)
        const fuelBed = new FuelBed({fuelModel, ...params})
        const fuelIgnition = new FuelIgnition({fuelBed, ...params})
        const fireBehavior = new FireBehavior({fuelIgnition, ...params})
        const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = fireBehavior
        const fireShape = new FireShape({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})
        const fireSize = new FireSize({fireShape, ...params})
        const fireVectorHead = new FireVectorHead({fireSize, ...params})
        const fireVectorBack = new FireVectorBack({fireSize, ...params})
        const fireVectorBeta = new FireVectorBeta({fireSize, ...params})
        const fireVectorBeta6 = new FireVectorBeta6({fireSize, ...params})
        const fireVectorPsi = new FireVectorPsi({fireSize, ...params})
        data.push({fuelKey, fuelModel, fuelBed, fuelIgnition, fireBehavior, fireShape, fireSize,
            fireVectorBack, fireVectorBeta, fireVectorBeta6, fireVectorHead, fireVectorPsi})
        n++
    }
}
let msec = fmt(performance.now() - t)
results.push({name: 'Initialize data structure', n, msec})

//-----------------------------------------------------------
// FuelBed
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fuelBed.update({fuelModel: data[i].fuelModel, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FuelBed.update()', n: data.length, msec})

//-----------------------------------------------------------
// FuelIgnition
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fuelIgnition.update({fuelBed: data[i].fuelBed, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FuelIgnition.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireBehavior
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireBehavior.update({fuelIgnition: data[i].fuelIgnition,...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireBehavior.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireShape
t = performance.now()
for(let i=0; i<data.length; i++) {
    const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = data[i].fireBehavior
    data[i].fireShape.update({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireShape.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireSize
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireSize.update({fireShape: data[i].fireShape, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireSize.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorHead
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireVectorHead.update({fireSize: data[i].fireSize, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireVectorHead.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBack
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireVectorBack.update({fireSize: data[i].fireSize, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireVectorBack.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBeta
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireVectorBeta.update({fireSize: data[i].fireSize, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireVectorBeta.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBeta6
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireVectorBeta6.update({fireSize: data[i].fireSize, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireVectorBeta6.update()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorPsi
t = performance.now()
for(let i=0; i<data.length; i++) {
    data[i].fireVectorPsi.update({fireSize: data[i].fireSize, ...params})
}
msec = fmt(performance.now() - t)
results.push({name: 'FireVectorPsi.update()', n: data.length, msec})

//---------------------------------------------------------------
// Results
for(let i=0; i<results.length; i++) {
    const {n, msec} = results[i]
    results[i].hertz = fmt(1000 * n / msec, 0) // .toLocaleString() // operations per second
    results[i]['sec/million'] = fmt(1000 * msec / n)    // sec per million ops
}
console.table(results)
