import { FuelModelFireTable } from '../use-cases/fuelModelFireTable.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb, ppm, ppt } from './assertions.js'
expect.extend({ parts })

function toObject(results) {
    const obj = {}
    for (let result of results)
        obj[result.code] = result
    return obj
}

function changeCount(results) {
    let nChanged = 0
    for(let result of results) {
        if (result.changed) nChanged++
    }
    return nChanged
}

describe('FuelModelFireTable use-case', () => {
    it(`Constructs initial state:`, () => {
        const fmft = new FuelModelFireTable()
        expect(fmft.fbfm.length).toBe(53)
    })

    it(`changes just dynamic fuel models when curedHerb changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.curedHerb = 0.5
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(17)
        expect(obj[1].changed).toBe(false)
        expect(obj.gr1.changed).toBe(true)
        expect(obj.tu4.changed).toBe(false)
    })
    
    it(`changes just fuel models with dead100h when moistureDead100h changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.moistureDead100h = 0.09
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(32)
        expect(obj[1].changed).toBe(false)
        expect(obj[2].changed).toBe(true)
    })
    
    it(`changes just fuel models with dead10h when moistureDead10h changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.moistureDead10h = 0.07
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(43)
        expect(obj[1].changed).toBe(false)
        expect(obj[2].changed).toBe(true)
    })
    
    it(`changes just fuel models with dead1h when moistureDead10h changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.moistureDead1h = 0.05
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(53)
        expect(obj[1].changed).toBe(true)
        expect(obj[2].changed).toBe(true)
    })
    
    it(`changes just fuel models with curableHerb when moistureLiveHerb changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.moistureLiveHerb = 0.5
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(17)
        expect(obj[1].changed).toBe(false)
        expect(obj.gr1.changed).toBe(true)
        expect(obj.tu4.changed).toBe(false)
    })
    
    it(`changes just fuel models with liveStem when moistureLiveStem changes:`, () => {
        let params, results, obj
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        params = {...fmft.params}

        params.moistureLiveStem = 1.5
        results = fmft.update(params)
        obj = toObject(results)

        expect(changeCount(results)).toBe(23)
        expect(obj[1].changed).toBe(false)
        expect(obj[2].changed).toBe(true)
        expect(obj.gs1.changed).toBe(true)
    })
    
    it(`produces results that aree with BP5 and BP6:`, () => {
        const bpParams = {
            // Updating the FuelBed
            curedHerb: 0.778,
            // Updating the FuelIgnition
            moistureDead1h: 0.05,
            moistureDead10h: 0.07,
            moistureDead100h: 0.09,
            moistureLiveHerb: 0.5,
            moistureLiveStem: 1.5,
            // Updating the FireBehavior
            midflameWindSpeed: 10*88,
            windBearing: 90,
            slopeRatio: 0.25,
            aspect: 180,
            limitWindSpeedFactor: true,
            limitSpreadRateToWindSpeed: true,
        }
        // Create the class an get a *COPY* of the parameters to modify
        const fmft = new FuelModelFireTable()
        const results = fmft.update(bpParams)
        const obj = toObject(results)
        console.log(obj)
        expect(obj[10].ros).toBe(18.55)
        expect(obj[10].flame).toBe(6.99)
    })
})

