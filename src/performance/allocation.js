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
        data.push({fuelKey, fuelModel: null, fuelBed: null, fuelIgnition: null, fireBehavior: null,
            fireShape: null, fireSize: null, head: null, back: null, beta: null, beta6: null, psi: null})
        n += 1
    }
}
let msec = fmt(performance.now() - t)
results.push({name: 'Initialize data structure', n, msec})

//-----------------------------------------------------------
// FuelModel
n=0
t = performance.now()
for(let i=0; i<1000; i++) {
    for(let fuelKey of fuelKeys) {
        const fuelModel = catalog.get(fuelKey)
        data[n++].fuelModel = fuelModel
    }
}
msec = fmt(performance.now() - t)
results.push({name: 'catalog.get()', n, msec})

//-----------------------------------------------------------
// FuelBed
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fuelModel = data[i].fuelModel
    data[i].fuelBed = new FuelBed(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FuelBed()', n: data.length, msec})

//-----------------------------------------------------------
// FuelIgnition
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fuelBed = data[i].fuelBed
    data[i].fuelIgnition = new FuelIgnition(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FuelIgnition()', n: data.length, msec})

//-----------------------------------------------------------
// FireBehavior
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fuelIgnition = data[i].fuelIgnition
    data[i].fireBehavior = new FireBehavior(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireBehavior()', n: data.length, msec})

//-----------------------------------------------------------
// FireShape
t = performance.now()
for(let i=0; i<data.length; i++) {
    const {headingSpreadRate, headingFromNorth, lengthWidthRatio, flameLength} = data[i].fireBehavior
    data[i].fireShape = new FireShape({headingSpreadRate, headingFromNorth, flameLength, lengthWidthRatio})
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireShape()', n: data.length, msec})

//-----------------------------------------------------------
// FireSize
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireShape = data[i].fireShape
    data[i].fireSize = new FireSize(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireSize()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorHead
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireSize = data[i].fireSize
    data[i].fireVectorHead = new FireVectorHead(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireVectorHead()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBack
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireSize = data[i].fireSize
    data[i].fireVectorBack = new FireVectorBack(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireVectorBack()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBeta
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireSize = data[i].fireSize
    data[i].fireVectorBeta = new FireVectorBeta(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireVectorBeta()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBack
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireSize = data[i].fireSize
    data[i].fireVectorBeta6 = new FireVectorBeta6(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireVectorBeta6()', n: data.length, msec})

//-----------------------------------------------------------
// FireVectorBack
t = performance.now()
for(let i=0; i<data.length; i++) {
    params.fireSize = data[i].fireSize
    data[i].fireVectorPsi = new FireVectorPsi(params)
}
msec = fmt(performance.now() - t)
results.push({name: 'new FireVectorPsi()', n: data.length, msec})

//---------------------------------------------------------------
// Results
for(let i=0; i<results.length; i++) {
    const {n, msec} = results[i]
    results[i].hertz = fmt(1000 * n / msec, 0) // .toLocaleString() // operations per second
    results[i]['sec/million'] = fmt(1000 * msec / n)    // sec per million ops
}
console.table(results)
