// Function used by use-cases

export function fmtVector(vectorRef, vector) {
    let {spreadRate, bearing, angleFromHead, distance, flameLength, east, north} = vectorRef
    return {vector, angleFromHead: fmt(angleFromHead), bearing: fmt(bearing), spreadRate: fmt(spreadRate),
        distance: fmt(distance), flameLength: fmt(flameLength), east: fmt(east), north: fmt(north)}
}

export function fmt(v, dec=2) {
    const e = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000]
    return Math.trunc(e[dec] * v) / e[dec] 
}