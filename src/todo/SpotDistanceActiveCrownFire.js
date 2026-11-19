/**
 * Javascript implementation of "Program for predicting spotting distance from an
 * active crown fire in uniformly forested flat terrain", November 1998, by Frank Albini.
 *
 * The following Javascript implementation was adopted from the MS FORTRAN source
 * code cited above and my own 'dist2a.for' derivative (which is also the basis of the
 * C++ version in BehavePlus V6).
 */
import {getSpotDistanceMountainTerrain } from './SpotDistance.js'

export class SpotDistanceActiveCrownFire {
    constructor() {
        this.init()
    }

    init() {
        this.levelDistance = 0
        this.firebrandHt = 0
        this.flatDistance = 0
        this.driftDistance = 0
        this.flameLength = 0
        this.windSpeedAtCanopyTop = 0
        this.flameHeightAboveCanopy = 0
        this.firebrandDropoutLayer = 0
        this.crownFirelineIntensity = 0
        this.canopyHt = 0
        this.windSpeedAt20Ft = 0
    }

    updateFromFlameLength(canopyHt, ws20, flameLength) {
        this.init()
        const crownFli = this.firelineIntensityThomas(flameLength)
        // makeSpotDistanceFromActiveCrownFire(canopyHt, ws20, flameLength)
        return this.updateFlatDistance(canopyHt, ws20, crownFli)
    }

    updateFromFirelineIntensity(canopyHt, ws20, crownFli) {
        this.init()
        return this.updateFlatDistance(canopyHt, ws20, crownFli)
    }

    // Calculates crown firebrand dropout altitude and distance, drift distance,
    // and total flat terrain spot distance.
    // Thin wrapper around distance() that performs input/output units conversions
    updateFlatDistance(
        canopyHt,    // Average crown top height of forest cover (ft)
        ws20,        // Wind speed at 20-ft (ft/min)
        crownFli)    // Crown fireline intensity (Btu/ft/s)
    {
        // Feet per meter
        const fpm = 3.2808

        // Average height of the canopy (m)
        const htop = canopyHt / fpm

        // Fire intensity (kW/m) (must be > 1000 kW/m)
        const fikwpm = 3.46414 * crownFli

        // Anemometer wind speed must be km/h
        const uan = (1.60934 * ws20) / 88

        // Anemometer height (m)
        const anem = 6.096

        // Wind speed at canopy top in m/s
        const utop = this.windSpeedCanopyTop(htop, uan, anem)

        // Firebrand diameter when it reaches the surface (mm)
        const diam = 1

        const [z, x, drift, spot, layer, flame] = this.distance(htop, fikwpm, utop, diam)

        // firebrand dropout plume coordinate height (ft)
        this.firebrandHt = fpm * z
        // firebrand dropout plume coordinate horizontal distance (ft)
        this.flatDistance = fpm * x
        // firebrand down-wind drift horizontal distance (ft)
        this.driftDistance = fpm * drift
        // firebrand down-wind spotting distance on flat terrain (ft)
        this.levelDistance =  fpm * spot

        // Crown fire flame length (ft)
        this.flameLength = this.flameLengthThomas(crownFli)
        // Wind speed at canopy top (ft/min)
        this.windSpeedAtCanopyTop = utop * 3.2808 * 60
        // Flame height above the canopy (ft)
        this.flameHeightAboveCanopy = flame * fpm
        // Firebrand droput layer [0-50000]
        this.firebrandDropoutLayer = layer
        // Input or derived crown fireline intensity (Btu/ft/s)
        this.crownFirelineIntensity = crownFli
        // Input tree/vegetation ht used (ft)
        this.canopyHt = canopyHt
        // Input wind speed at 20 ft (ft/min)
        this.windSpeedAt20Ft = ws20
        return this
    }

    updateTerrainDistance(
        location,           // 'midslopeWindward', 'valleyBottom', 'midslopeLeeward', or 'ridgeTop'
        ridgeToValleyDist,  // Horizontal distance from ridge top to valley bottom (ft)
        ridgeToValleyElev)  // Vertical distance from ridge top to valley bottom (ft)
    {
        this.location = location
        this.ridgeToValleyDist = ridgeToValleyDist
        this.ridgeToValleyElev = ridgeToValleyElev
        this.terrainDistance = getSpotDistanceMountainTerrain(
            this.levelDistance, location, ridgeToValleyDist, ridgeToValleyElev)
    }

    /**
     * Adapted from Albini's MS FORTRAN PROGRAM DIST().
     *
     * @param {real} htop Average crown top height of forest cover (m)
     * @param {real} fikwpm Fire intensity (kW/m) (must be > 1000 kW/m)
     * @param {real} utop Wind speed at canopy top, (m/s)
     * @param {real} diam Firebrand diameter when it reaches the surface (mm)
     *
     * @return {array} [fbHeight, fbDist, fbDrift, flatSpotDist, layer], where
     *  dbHeight is the firebrand dropout plume coordinate height (m)
     *  dbDist is the firebrand dropout plume coordinate distance (m)
     *  dbDrift is the firebrand down-wind drift distance (m)
     *  flatSpotDist is the firebrand down-wind spotting distance on flat terrain (m)
     *  layer is the plume profile layer
     *  flame is flame height above canopy top (m)
     */
    distance(htop, fikwpm, utop, diam) {
        // flame = flame height above the canopy top (m)
        const flame = this.flameHeightAlbini(fikwpm, utop, htop)
        if (flame <= 0)
            return [0, 0, 0, 0, 0, 0]
        // if (ido===2) fikwpm = fireIntensityAlbini(flame, utop, htop)

        // hf = normalized flame height above the canopy top (dl)
        const hf = flame / htop

        // uc = normalized wind speed at the crown top
        const g = 9.82      // Acceleration of gravity, m / s^2
        const wn = Math.sqrt(g * htop)
        const uc = utop / wn

        // dlosmm = ember diameter loss from the top of the plume till it hits the surface
        const dlosmm = 0.064 * htop

        // dhitmm = ember diameter when it hits the ground (mm)
        const dhitmm = diam

        // dtopmm = ember diameter when it reaches the top of the plume (mm)
        const dtopmm = dhitmm + dlosmm

        // eta = 'safety factor' for firebrand diameter on impact (eta > 1.)
        const eta = dtopmm / dlosmm

        // Determine firebrand dropout location within the plume.  Outputs are:
        //  zdrop = normalized vertical firebrand dropout altitude (dl) (m / htop)
        //  xdrop = corresponding dropout normalized distance down wind (dl) (m / htop)
        //  layer = plume layer where dropout occurs
        const [zdrop, xdrop, layer] = this.dropout(hf, uc, eta)

        // xdrift = normalized down wind drift distance (dl) (m / htop)
        const xdrift = this.drift(zdrop, eta, uc)

        // xspot = normalized total spotting distance on flat terrain (m / htop)
        const xspot = xdrop + xdrift

        // Convert normalized distances to m
        const fbHeight = zdrop * htop
        const fbDist = xdrop * htop
        const fbDrift = xdrift * htop
        const flatSpotDist = xspot * htop
        return [fbHeight, fbDist, fbDrift, flatSpotDist, layer, flame]
    }

    /**
     * According to Albini:
     * "Calculates normalized down wind drift distance, 'delx',
     * for a firebrand particle injected into log profile wind field at
     * normalized altitude 'zdrop' and entering the canopy with diameter
     * equal to 'eta' times that necessary to reach the surface."
     *
     * Adapted from Frank Albini's 'drift.for' FORTRAN source, SUBROUTINE DRIFT()
     *
     * @param {real} zdrop Normalized firebrand drop-out altitude (dl) (m / htop)
     * @param {real} eta Safety factor (eta>1)
     * @param {real} uc Normalized horizontal wind speed at crown top (dl)
     * @return {real} Normalized down wind firebrand drift distance (m / htop)
     */
    drift(zdrop, eta, uc) {
        const f0 = 1 + 2.94 * zdrop
        const f1 = Math.sqrt(eta / (eta + zdrop))
        const f2 = eta > 0.34 ? Math.sqrt(eta / (eta - 0.34)) : 0
        const f3 = f1 > 0 ? f2 / f1 : 0
        const f2log = f2 > 1 ? Math.log((f2 + 1) / (f2 - 1)) : 0
        const f3log = f3 > 1 ? Math.log((f3 + 1) / (f3 - 1)) : 0
        const F = f3 > 0 ? 1 + Math.log(f0) - f1 + (f3log - f2log) / f3 : 0
        const xdrift = 10.9 * F * uc * Math.sqrt(zdrop + eta)
        return xdrift
    }

    /**
     * Calculates firebrand drop-out altitude and distance
     *
     * @param {real} hf  Normalized flame height above the canopy top (dl)
     * @param {real} uc Normalized horizontal wind speed at crown top (dl)
     * @param {real} eta Safety factor (eta>1)
     * @returns {array} [zdrop, xdrop, layer], where
     *  zdrop = normalized vertical firebrand dropout altitude (dl) (m / htop)
     *  xdrop = corresponding dropout normalized distance down wind (dl) (m / htop)
     *  layer = plume layer where dropout occurs
     */
    dropout(hf, uc, eta) {
        // Delta x-z iteration factor
        const ds = 0.2

        // qfac = constant used to determine sufficient qreq at each layer
        const qfac = uc > 0 ? 0.00838 / (uc * uc) : 0

        // Albini's FUNCTION tip()
        const rfc = 1 + 2.94 * hf;
        let fm = 0.468 * rfc * Math.log(rfc);
        const fmuf = 1.3765 * (hf + rfc * Math.log(rfc)**2);
        const uf = fmuf / fm;
        const ctn2f = rfc - 1 + rfc * Math.log(rfc)**2;
        const tang = (1.4 * hf) / (uc * Math.sqrt(ctn2f));
        const ang = Math.atan(tang);
        const wf = tang * uf;
        const vf = Math.sqrt(uf * uf + wf * wf);
        const rhof = 0.6;
        const bf = fm / (rhof * vf);
        // end tip()

        let sing = Math.sin(ang);
        let cosg = Math.cos(ang);
        let delx = 0.5 * bf * sing;
        let delz = 0.5 * bf * cosg;

        const zc2 = hf;
        const xc2 = hf / Math.tan(ang);
        const fmf = fm;
        const tratf = (2 * fmf) / 3;
        const fmadd = fm > 0 ? 0.2735 * fm : 0;
        const hfarg = 1 + 2.94 * hf;
        const fmuadd = 0.3765 * (hf + hfarg * Math.log(hfarg)**2);
        let fmw = fm * wf;
        const dmwfac = uc > 0 ? (2 * fmf) / (3 * uc * uc) : 0;
        let w = wf;
        let V = vf;
        let z = hf;
        let x = xc2;

        // Level 1
        let q = 0.5 * rhof * wf * wf;
        let xb = delx;
        let zb = 0;

        // Level 2
        q = 0.5 * rhof * wf * wf;
        xb = xc2 + delx;
        zb = zc2 - delz;
        let zp = zb;
        let xp = xb;

        let layer = 2;
        let qreq = qfac * (zb + eta);
        if (q <= qreq) {
            // console.log('plume cannot lift a particle large enough to provide the "eta" saftey factor')
            return [0, 0, 0];
        }
        while (true) {
            layer += 1;
            const dx = ds * cosg;
            const dz = ds * sing;
            x = x + dx;
            z = z + dz;
            const zarg = 1 + 2.94 * z;
            fm = 0.34 * zarg * Math.log(zarg) + fmadd;
            const fmu = z + 0.34 * zarg * Math.log(zarg)**2 + fmuadd;
            const trat = 1 + tratf / fm;
            const u = fmu / fm;
            fmw = fmw + (dmwfac / V) * dz;
            w = fmw / fm;
            V = Math.sqrt(u * u + w * w);
            const b = (fm * trat) / V;
            sing = w / V;
            cosg = u / V;
            delx = 0.5 * b * sing;
            delz = 0.5 * b * cosg;
            xb = x + delx;
            zb = z - delz;
            q = (0.5 * w * w) / trat;
            qreq = qfac * (zb + eta);
            // Compare with dist2a_plume.csv
            // console.log(k, q[k], xb[k], zb[k], ang, dx, dz, x, z, zarg)
            // fm, fmu, trat, u, fmw, w, V, b, sing, cosg, delx, delz)
            if (q < qreq) {
                return [zp, xp, layer - 1];
            }
            zp = zb; // store as previous layer value
            xp = xb; // store as previous layer value
            if (layer > 50000) {
                throw new Error('dropout() exceeded 50000 layers');
            }
        }
    }

    /**
     * Calculates crown fire intensity from average flame HEIGHT above canopy top
     * as per Albini's MS FORTRAN FUNCTION FINT().
     *
     * @param {real} flame  Average flame height above canopy top (m)
     * @param {real} utop Mean wind speed at canopy top height (m/s)
     * @param {real} htop Canopy top height (m)
     * @return {real} fint Fire intensity (kW/m)
     */
    fireIntensityAlbini(flame, utop, htop) {
        const y = htop > 0 ? 1 + (2.94 * flame) / htop : 0;
        const con = y > 0 ? y * Math.log(y) : 0;
        return (con * utop * htop) / 7.791e-3;
    }

    /**
     * Calculates crown fire intensity from crown fire flame length using Thomas equation.
     * @param {real} flameLength Crown fire flame length (ft)
     * @return {real} Crown fire intensity (btu/ft/s) (multiply by 3.46414 to obtain kW/m)
     */
        firelineIntensityThomas(flameLength) {
            return flameLength <= 0 ? 0 : Math.pow(5*flameLength, 3/2);
    }

    /**
     * Calculate crown fire flame length from crown fire intensity using Thomas' equation.
     * @param {real} fli Crown fire intensity (btu/ft/s)
     * @return {real} Crown fire flame length (ft)
     */
    flameLengthThomas(fli) {
	    return fli <= 0 ? 0 : 0.2 * Math.pow(fli, 2/3);
    }

    /**
     * Estimates crown fire average flame HEIGHT (not length) above canopy top (m)
     *
     * Adapted from Albini's MS FORTRAN FUNCTION HEIGHT().
     *
     * @param {real} fikwpm Fire intensity (kW/m) (must be > 1000 kW/m)
     * @param {real} utop  Mean wind speed at canopy top (m/s)
     * @param {real} htop Average crown top height of forest cover (m)
     * @return {real} Average height of flame above canopy top (m)
     */
    flameHeightAlbini(fikwpm, utop, htop) {
        if (htop * utop <= 0 || fikwpm < 1000) return 0;
        const con = (7.791e-3 * fikwpm) / (utop * htop);
        let ylow = 1;
        let yhigh = Math.exp(con);
        // As 'con' approaches 780, 'yhigh' approaches Infinity,
        // which causes endless binary seach loop.  So cap it...
        // console.log(`Start flameHeightAlbini(): con=${con}, yhigh=${yhigh}`)
        if (yhigh === Infinity) {
            yhigh = Number.MAX_VALUE;
            // console.log(` RESET: con=${con}, yhigh=${yhigh}`)
        }
        let loop = 1;
        while (true) {
            const y = 0.5 * (ylow + yhigh);
            const test = y * Math.log(y);
            if (Math.abs(test - con) <= 1e-6) {
                const height = (htop * (y - 1)) / 2.94;
                // console.log(`Loop ${loop} ylow=${ylow}, yhigh=${yhigh}`)
                return height;
            }
            loop = loop + 1;
            if (loop > 10000) {
                // The following statement should never be executed, but still...
                throw new Error('flameHeightAlbini() binary search endless loop detected');
            }
            if (test >= con) yhigh = y;
            if (test < con) ylow = y;
        }
    }

    /**
     * Estimates the mean wind speed at canopy top (m/s)
     * Adapted from Albini's MS FORTRAN PROGRAM DIST() around statements 45 to 50
     *
     * @param {real} htop Average crown top height of forest cover (m)
     * @param {real} uan Measured wind speed at anemometer height (km/h)
     * @param {real} anem Height of measured wind speed (m)
     * @return {real} utop Mean wind speed at canopy top (m/s)
     */
    windSpeedCanopyTop(htop, uan, anem) {
        const zonh = htop > 0 ? anem / htop : 0;
        const fact = 1 + Math.log(1 + 2.94 * zonh);
        const utop = uan / (3.6 * fact);
        return utop;
    }
}
