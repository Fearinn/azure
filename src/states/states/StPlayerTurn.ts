class StPlayerTurn extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_playerTurn) {
    const { _private } = args;
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeSelectable(_private.selectableSpaces);

    this.game.statusBar.addActionButton(_("play gifted stone instead"), () => {
      this.game.setClientState("client_placeGifted", {
        /* @ts-ignore */
        descriptionmyturn: _("${you} must place your gifted stone"),
      });
    });
  }

  leave() {
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeUnselectable();
  }
}

interface arg_playerTurn {
  _private: {
    selectableSpaces: SpaceCard[];
  };
}
