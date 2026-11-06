import { FuelModelCatalog, FuelBed, FuelIgnition, FireBehavior, FireShape, FireSize } from '#lib/index.js'
import { FireVectorBack, FireVectorBeta, FireVectorBeta6, FireVectorHead,
    FireVectorPsi } from '#lib/index.js'

export class FireState {
    constructor(params={}) {
        this.params = params
        this.prevParams = params
        
        // Configuration
        this.fuelModelActive = true

        // Initial state
        this.fuelCatalog = new FuelModelCatalog()
        this.fuelModel = this.fuelCatalog.get(params.fuelKey)
        this.fuelBed = new FuelBed(params)
        this.fuelIgnition = new FuelIgnition(params)
        this.fireBehavior = new FireBehavior(params)

        // Promote FireBehavior results that are also observed fire behavior inputs
        this.headingSpreadRate = this.fireBehavior.headingSpreadRate
        this.flameLength = this.fireBehavior.flameLength
        this.headingFromNorth = this.fireBehavior.headingFromNorth
        this.lengthWidthRatio = this.fireBehavior.lengthWidthRatio

        this.fireShape = new FireShape(params)
        this.fireSize = new FireSize(params)
        this.headVector = new FireVectorHead(params)
        this.backVector = new FireVectorBack(params)
        this.beta5Vector = new FireVectorBeta(params)
        this.beta6Vector = new FireVectorBeta6(params)
        this.psiVector = new FireVectorPsi(params)
        
        // Inputs groups
        this.fuelMoistures = [
            'moistureDead1h',
            'moistureDead10h',
            'moistureDead100h',
            'moistureLiveHerb',
            'moistureLiveStem',
        ]

    }
    updateParams(params) {
        this.prevParams = this.params
        this.params = params
        return this.#process()
    }

    #isDiff(key) { return this.params[key] !== this.prevParams[key] }

    #process() {
        if (this.fuelModelActive && this.#isDiff('fuelKey')) {
            this.fuelModel = this.fuelCatalog.get(this.fuelKey)
        }
        if (this.fuelBedActive && this.#isDiff('curedHerb')) {
            this.fuelBed.update(this.params)
        }
        if (this.fuelIgnitionActive && this.#anyDiffs(this.fuelMoistures)) {
            this.fuelIgnition.update(this.params)
        }
        if (this.fireBehaviorActive && this.#anyDiffs(this.windSlope)) {
            this.fireBehavior.update(this.params)
            // Promote FireBehavior results that are also observed fire behavior inputs
            this.headingSpreadRate = this.fireBehavior.headingSpreadRate
            this.flameLength = this.fireBehavior.flameLength
            this.headingFromNorth = this.fireBehavior.headingFromNorth
            this.lengthWidthRatio = this.fireBehavior.lengthWidthRatio
        }
    }
}