class GemSwapInfo {
    constructor(index,index1, index2, sizeMatch, type, modifier)
    {
        this.index  = index;
        this.index1 = index1;
        this.index2 = index2;
        this.sizeMatch = sizeMatch;
        this.type = type;
        this.modifier = modifier;
    }

    getIndexSwapGem() {
        console.log(this,'getIndexSwapGem')
        return [this.index1, this.index2];
    }
}