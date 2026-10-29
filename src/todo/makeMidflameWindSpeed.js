import { divide, positive } from './utils.js'

export function makeMidflameWindSpeed(canopyPod, fuelBedPod, windSpeed20ft, propsLevel=0) {
    // Get required properties
    let {canopyHeight:ht, canopyBase:base, canopyCover:cover} = canopyPod
    let {fuelMidflameWsrf} = fuelBedPod

    // Canopy midflame wrf
    let length = positive(ht - base)
    let ratio = divide(length, ht)
    let fill = cover * ratio / 3
    let sheltered = cover >= 0.01 && fill >= 0.05 && ht >= 6
    let canopyMidflameWsrf = (! sheltered) ? 1
        : 0.555 / (Math.sqrt(fill * ht) * Math.log((20 + 0.36 * ht) / (0.13 * ht)))

    // Wrsf and midflame wind speed
    let midflameWsrf = Math.min(fuelMidflameWsrf, canopyMidflameWsrf)
    let midflameWindSpeed = windSpeed20ft * midflameWsrf

    let pod = {
        midflameWindSpeed
    }
    if (propsLevel > 0) {
        pod = {
            ...pod,
            canopyMidflameWsrf,
            fuelMidflameWsrf,
            midflameWsrf: Math.min(canopyMidflameWsrf, fuelMidflameWsrf),
            windSpeed20ft,
        }
    }
    if (propsLevel > 1) { // add newly derived canopy properties
        pod = {
            ...pod,
            fuelDepth: fuelBedPod.depth,
            canopyFill: fill,
            canopySheltersFuel: sheltered,    
        }
    }
    return pod
}
