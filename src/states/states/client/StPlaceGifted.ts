class StPlaceGifted extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_placeGifted) {
    const { _private } = args;
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeSelectable(_private.selectableGifted);

    this.game.statusBar.addActionButton(
      _("cancel"),
      () => {
        this.game.restoreServerGameState();
      },
      {
        color: "alert",
      }
    );
  }

  leave() {
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeUnselectable();
  }
}

interface arg_placeGifted {
  _private: {
    selectableGifted: SpaceCard[];
  };
}
