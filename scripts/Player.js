class Player {
  constructor(playerId, name) {
    this.playerId = playerId;
    this.displayName = name;
    this.heroes = [];
    this.heroGemType = new Set();
  }

  getTotalHeroAlive() {
    return this.getHerosAlive().length;
  }

  getHerosAlive() {
    return this.heroes.filter((hero) => hero.isAlive());
  }

  getCastableHeros() {
    let arr = this.heroes.filter((hero) => hero.isAlive() && hero.isFullMana());
    return arr;
  }

  anyHeroFullMana() {
    let arr = this.heroes.filter((hero) => hero.isAlive() && hero.isFullMana());

    let hero =
      arr != null && arr != undefined && arr.length > 0 ? arr[0] : null;

    return hero;
  }

  firstHeroAlive() {
    let arr = this.heroes.filter((hero) => hero.isAlive());

    let hero =
      arr != null && arr != undefined && arr.length > 0 ? arr[0] : null;
    return hero;
  }

  heroHighestAlive() {
    let arr = this.heroes.filter((hero) => hero.isAlive());
    let max = arr[0];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].attack > max.attack) {
        max = arr[i];
      }
    }
    return max;
  }

  lastHero() {
    let arr = this.heroes.filter((hero) => hero.isAlive());

    return arr[arr.length - 1];
  }

  getRecommendGemType() {
    this.heroGemType = new Set();

    for (let i = 0; i < this.heroes.length; i++) {
      let hero = this.heroes[i];
      for (let j = 0; j < hero.gemTypes.length; j++) {
        let gt = hero.gemTypes[j];
        this.heroGemType.add(GemType[gt]);
      }
    }

    return this.heroGemType;
  }

  firstAliveHeroCouldReceiveMana(type) {
    const res = this.heroes.find(
      (hero) => hero.isAlive() && hero.couldTakeMana(type)
    );
    return res;
  }

  clone() {
    const cloned = new Player(this.playerId, this.displayName);
    cloned.heroes = this.heroes.map((hero) => hero.clone());
    cloned.heroGemType = new Set(Array.from(this.heroGemType));
    return cloned;
  }
}
