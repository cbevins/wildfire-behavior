export class CanopyStructure {
    constructor() {
        this.height = 0
        this.length = 0
        this.base = 0
        this.ratio = 1
        this.cover = 0
        this.fill = 0
        this.sheltersFuel = false
        this.midflameWsrf = 1
    }
    // WfbxState has previously set any the object input properties,
    // these methods are called to update dependent properties
    updateFromHeightBase() {
        this.length = Math.max(0, this.height - this.base)
        this.ratio = (this.height > 0) ? (this.length / this.height) : 0
        this.update()        
    }
    updateFromHeightLength() {
        this.base = Math.max(0, this.height - this.length)
        this.ratio = (this.height > 0) ? (this.length / this.height) : 0
        this.update()        
    }
    updateFromHeightRatio() {
        this.length = this.height * this.ratio
        this.base = Math.max(0, this.height - this.length)
        this.update()        
    }
    updateFromLengthBase() {
        this.height = this.length + this.base
        this.ratio = (this.height > 0) ? (this.length / this.height) : 0
        this.update()        
    }
    update() {
        this.fill = this.cover * this.ratio / 3
        this.sheltersFuel = this.cover >= 0.01 && this.fill >= 0.05 && this.height >= 6
        const ht = this.height
        this.midflameWsrf = (! this.sheltersFuel) ? 1
            : 0.555 / (Math.sqrt(this.fill * ht) * Math.log((20 + 0.36 * ht) / (0.13 * ht)))
    }
}
