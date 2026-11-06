import { FuelModelFireTable } from '../use-cases/fuelModelFireTable.js'

import { describe, it, expect } from 'vitest'
import { parts, ppb, ppm, ppt } from './assertions.js'
expect.extend({ parts })

describe('FuelModelFireTable use-case', () => {
    it(`Constructs initial state:`, () => {
        const fmft = new FuelModelFireTable()
        expect(fmft.fbfm.length).toBe(53)
    })
})
