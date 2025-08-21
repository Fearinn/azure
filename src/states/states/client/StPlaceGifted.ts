class StPlaceGifted extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_placeGifted) {
    const { _private } = args;

    this.game.statusBar.addActionButton(
      _("cancel"),
      () => {
        this.game.restoreServerGameState();
      },
      {
        color: "alert",
      }
    );

    const player_id = Number(this.game.getActivePlayerId());

    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeSelectable(_private.selectableGifted, "act_placeGifted");

    const giftedManager = new GiftedManager(this.game);
    giftedManager.highlight(true);

    const stoneManager = new StoneManager(this.game);
    stoneManager.highlightGifted(player_id, true);
  }

  leave() {
    const player_id = this.game.getActivePlayerId();

    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeUnselectable();

    const giftedManager = new GiftedManager(this.game);
    giftedManager.highlight(false);

    const stoneManager = new StoneManager(this.game);
    stoneManager.highlightGifted(player_id, false);
  }
}

interface arg_placeGifted {
  _private: {
    selectableGifted: SpaceCard[];
  };
}
