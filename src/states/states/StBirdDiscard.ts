class StBirdDiscard extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_birdDiscard) {
    console.log("BIRD DISCARD");
    const qiManager = new QiManager(this.game);
    qiManager.makeSelectable();
  }

  leave() {
    const qiManager = new QiManager(this.game);
    qiManager.makeUnselectable();
  }
}

interface arg_birdDiscard {}
