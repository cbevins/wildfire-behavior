// @ts-nocheck

function testsScorchHeight(fli, f=77, fpm=0) {
    const mph = fpm / 88
    return (fli > 0) ? ((63 / (140 - f)) * fli**(7/6)) /
        Math.sqrt(fli + mph * mph * mph) : 0
}

function vanWagnerScorchHeight(fli, f=77, mph=0) {
    if (fli > 0) {
        const num = 1.4 * fli**(7/6)
        const w3 = mph * mph * mph
        const den = (140-f) * Math.sqrt((0.107 * fli + w3))
        return num / den
    }
    return 0
}

export function utilsScorchHeight(fli, f=77, fpm=0) {
    const mph = fpm / 88
    return (fli> 0) ?
        ((63 / (140 - f)) * fli**(7/6)) /
        Math.sqrt(fli + mph * mph * mph) : 0
}

function behaveScorchHeight (fli, f, fpm) {
    const mph = fpm / 88
    return fli <= 0 ? 0
        : ((63 / (140 - f)) * Math.pow(fli, (7/6))) /
            Math.sqrt(fli + mph * mph * mph)
}


//------------------------------------------------------------------------------
/*! \brief Calculates scorch height from fireline intensity, wind speed, and
 *  air temperature.
 *
 *  \param firelineIntensity Fireline (Byram's) intensity (btu/ft/s).
 *  \param windSpeed         Wind speed at midlame height (m/h).
 *  \param airTemperature    Air temperature (oF).
 *
 *  \return Scorch height (ft).
 */

function FBL_SurfaceFireScorchHeight(firelineIntensity, windSpeed, airTemperature) {
    return ( firelineIntensity <=0 ) ? ( 0.0 )
        : ( 63. / ( 140. - airTemperature ) ) * Math.pow( firelineIntensity, (7/6) )
            / Math.sqrt(firelineIntensity + (windSpeed * windSpeed * windSpeed))
}

const fli = 389.95413667947145
const fpm = 880
const mph = fpm / 88
const f = 95

console.log('Behave', behaveScorchHeight(fli, f, fpm))
console.log('utils', utilsScorchHeight(fli, f, fpm))
console.log('tests', testsScorchHeight(fli, f, fpm))
console.log('VanWagner', vanWagnerScorchHeight(fli, f, mph))
console.log('FBL_SurfaceFireScorchHeight', FBL_SurfaceFireScorchHeight(fli, mph, f))