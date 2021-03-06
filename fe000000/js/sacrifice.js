let Sacrifice = {
  sacrificeMultiplier() {
    return player.sacrificeMultiplier;
  },
  setSacrificeMultiplier(x) {
    player.sacrificeMultiplier = x;
  },
  hasStrongerSacrifice() {
    return InfinityChallenge.isInfinityChallengeRunning(2) || InfinityChallenge.isInfinityChallengeCompleted(2);
  },
  sacrificeExponent() {
    if (InfinityChallenge.isInfinityChallengeRunning(2)) {
      return 1 / 8;
    } else if (InfinityChallenge.isInfinityChallengeCompleted(2)) {
      return 1 / 64;
    } else {
      return 0;
    }
  },
  sacrificeRequirement() {
    // Decimal.pow(2, Infinity) is 0, but Decimal.pow(2, 1e20) isn't,
    // so we take the min with 1e20 in case this.sacrificeMultiplier()
    // is too big to be converted to number.
    let req = Decimal.pow(2, 16 * (Challenge.isChallengeRunning(10) ? 1 : this.sacrificeMultiplier().min(1e20).toNumber()));
    if (this.hasStrongerSacrifice()) {
      req = req.min(this.sacrificeMultiplier().pow(1 / this.sacrificeExponent()));
    }
    return req;
  },
  canSacrifice() {
    return Generator(8).amount().gt(0) && player.stars.gte(this.sacrificeRequirement()) && !InfinityPrestigeLayer.mustInfinity();
  },
  isVisible() {
    // This basically used to be as follows: this.canSacrifice() || this.sacrificeMultiplier().gt(1) || player.infinities > 0 || player.eternities.gt(0);
    // Seeing that things are possible probably isn't too intimidating, so I'm experimenting with making it always true.
    // Actually let's hide it if G8 is impossible to get (also covers IC1).
    return !Challenge.isChallengeEffectActive(6);
  },
  newSacrificeMultiplier() {
    let mult = new Decimal(player.stars.log(2) / 16);
    if (this.hasStrongerSacrifice()) {
      mult = mult.max(player.stars.pow(this.sacrificeExponent()));
    }
    if (Challenge.isChallengeRunning(10)) {
      mult = mult.times(this.sacrificeMultiplier());
    }
    return this.canSacrifice() ? mult : this.sacrificeMultiplier();
  },
  sacrificeMultiplierGain() {
    return this.newSacrificeMultiplier().minus(this.sacrificeMultiplier());
  },
  sacrificeMultiplierMultGain() {
    return this.newSacrificeMultiplier().div(this.sacrificeMultiplier());
  },
  sacrificeConfirmationMessage() {
    return 'Are you sure you want to sacrifice to increase your sacrifice multiplier from ' +
      format(this.sacrificeMultiplier()) + ' to ' + format(this.newSacrificeMultiplier()) + '?';
  },
  sacrifice(manual) {
    if (!this.canSacrifice()) return;
    if (manual && Options.confirmation('sacrifice') && !confirm(this.sacrificeConfirmationMessage())) return;
    this.setSacrificeMultiplier(this.newSacrificeMultiplier());
    Goals.recordPrestige('sacrifice');
    this.sacrificeReset();
  },
  sacrificeReset() {
    if (Challenge.isChallengeRunning(10)) {
      // Challenge 10 overrides Eternity Milestone 4.
      Stars.setAmount(Stars.startingAmount());
      player.boost = {bought: 0};
      player.generators = initialGenerators();
      player.highestGenerator = 0;
    } else if (!EternityMilestones.isEternityMilestoneActive(4)) {
      Generators.resetAmounts(7);
    }
    // Sacrificing still resets times (this matters in a few challenges
    // and in stats tab).
    player.stats.timeSincePurchase = 0;
    player.stats.timeSinceSacrifice = 0;
  }
}
