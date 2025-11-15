class StGatherBountiful extends StateManager {
  protected utils: Utils;

  constructor(game: Azure) {
    super(game);
    this.utils = new Utils(this.game);
  }

  enter(args: arg_gatherBountiful) {
    const giftedManager = new GiftedManager(this.game);
    giftedManager.highlight(true);

    const utils = this.utils;

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
