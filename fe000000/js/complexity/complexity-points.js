let ComplexityPoints = {
  amount() {
    return player.complexityPoints;
  },
  totalCPProduced() {
    return player.stats.totalCPProduced;
  },
  addAmount(x) {
    player.complexityPoints = player.complexityPoints.plus(x);
    player.stats.totalCPProduced = player.stats.totalCPProduced.plus(x);
  }
}