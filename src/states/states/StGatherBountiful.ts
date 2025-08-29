class StGatherBountiful extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_gatherBountiful) {
    const giftedManager = new GiftedManager(this.game);
    giftedManager.highlight(true);

    const utils = new Utils(this.game);

    this.game.statusBar.addActionButton(_("card"), () => {
      utils.performAction("act_gatherBountiful", {
        boon: "qi",
      });
    });

    this.game.statusBar.addActionButton(_("point"), () => {
      utils.performAction("act_gatherBountiful", {
        boon: "wisdom",
      });
    });
  }

  leave() {
    const giftedManager = new GiftedManager(this.game);
    giftedManager.highlight(false);
  }
}

interface arg_gatherBountiful {}
