class Player
{
    // public int playerId;
    // public string displayName;
    // public List<Hero> heroes;
    // public HashSet<GemType> heroGemType;

    constructor(playerId, name)
    {
        this.playerId = playerId;
        this.displayName = name;

        console.log(this);

        //heroes = new List<Hero>();
        //heroGemType = new HashSet<GemType>();
    }

    // public Hero anyHeroFullMana() {
    //     foreach(var hero in heroes){
    //         if (hero.isAlive() && hero.isFullMana()) return hero;
    //     }

    //     return null;
    // }

    // public Hero firstHeroAlive() {
    //     foreach(var hero in heroes){
    //         if (hero.isAlive()) return hero;
    //     }

    //     return null;
    // }

    // public HashSet<GemType> getRecommendGemType() {
    //     heroGemType.Clear();
    //     foreach(var hero in heroes){
    //         if (!hero.isAlive()) continue;
            
    //         foreach(var gt in hero.gemTypes){
    //             heroGemType.Add((GemType)gt);
    //         }
    //     }

    //     return heroGemType;
    // }
}

// module.exports = Player