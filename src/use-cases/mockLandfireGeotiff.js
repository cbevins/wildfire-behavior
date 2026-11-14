import { FuelModelCatalog } from '#lib/index.js'
import { fmt } from './utils.js'

// Mocks a LANDFIRE multi-band geotiff image
export function mockLandfireGeotiff(rows, cols) {
    const cells = rows * cols
    const fuelCatalog = new FuelModelCatalog()
    const fbfm40 = mockRaster(cells, fuelCatalog.getNumberKeys())
    const slp = mockRaster(cells, [0, 0.1, 0.25, 0.5, 1, 2, 4, 8])
    const asp = mockRaster(cells, [0, 45, 90, 135, 180, 225, 270, 315])
    const canopies = [{b:0, h:0, c:0},
        {b:10, h:20, c:0.5}, {b:10, h:20, c:1},
        {b:10, h:50, c:0.5}, {b:10, h:50, c:1},
        {b:10, h:100, c:0.5}, {b:10, h:100, c:1},
        {b:20, h:100, c:0.5}]
    const {cc, ch, cbh} = mockCanopyRaster(cells, canopies)
    return {fbfm40, slp, asp, cc, cbh, ch}
}

// Just cycles through an array of values
function mockRaster(n, values) {
    const raster = []
    let idx = 0
    for(let i=0; i<n; i++) {
        if (idx === values.length) idx = 0
        raster[i] = values[idx++]
    }
    return raster
}

// Canopy height, base height, and cover are inter-related (for example, base must be < height)
// so assign them from valid triplets
function mockCanopyRaster(n, values) {
    const cbh = []
    const ch = []
    const cc = []
    let idx = 0
    for(let i=0; i<n; i++) {
        if (idx === values.length) idx = 0
        cbh[i] = values[idx].b
        ch[i] = values[idx].h
        cc[i] = values[idx].c
        idx++
    }
    return {cbh, ch, cc}
}

export function displayMap(rows, cols, values, title=null) {
    const table = []
    let idx = 0
    for(let row=0; row<rows; row++) {
        const line = []
        for(let col=0; col<cols; col++) {
            line.push(fmt(values[idx++]))
        }
        table.push(line)
    }
    if (title) console.log('Map of', title)
    console.table(table)
}
