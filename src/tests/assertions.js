export const ppb = 1.0e-9  // parts per billion
export const ppm = 1.0e-6  // parts per million
export const ppt = 1.0e-3  // parts per thousand

// Assert the difference of two numbers is with a certain ratio limit
// For example, if sigma = 1.0e-92, the limit is 1 part per billion
export const parts = function (received, expected, sigma=1.0e-9) {
    const diff = (expected === 0 ) 
        ? Math.abs(received - expected)
        : Math.abs((received-expected) / expected)
    return {
        message: () =>
        `value differs by more than 1 part per ${(1/sigma).toFixed(0)}\nexpected value = ${expected}\nreceived value = ${received}\n`,
        pass: (diff < sigma)
    }
}
