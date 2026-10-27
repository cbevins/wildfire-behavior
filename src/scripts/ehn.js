const table = []
for(let savr of [3500, 3000, 2500, 2200, 2000, 1800, 1750, 1600, 1500, 1400, 1300, 1200, 750, 109, 30]) {
    const dead = Math.exp(-138 / savr)
    const live = Math.exp(-500 / savr)
    table.push({savr, dead, live})
}
console.log('Effective Heating Number by SAVR')
console.table(table)
