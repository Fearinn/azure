class StPlayerTurn extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_playerTurn) {
    const { _private, bonds } = args;
    this.game.gamedatas.bonds = bonds;

    const spaceManager = new SpaceManager(this.game);
    spaceManager.highlightBonds();

    if (!this.game.isCurrentPlayerActive()) {
      return;
    }

    const { selectableSpaces, canPlayGifted } = _private;
    spaceManager.makeSelectable(selectableSpaces);

    if (canPlayGifted) {
      this.game.statusBar.addActionButton(
        _("play gifted stone instead"),
        () => {
          this.game.setClientState("client_placeGifted", {
            descriptionmyturn: _("${you} must place your gifted stone"),
          });
        },
        { color: "secondary", id: "azr_giftedStoneBtn" }
      );
    }
  }

  leave() {
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeUnselectable();
  }
}

interface arg_playerTurn {
  _private: {
    selectableSpaces: SpaceCard[];
    canPlayGifted: boolean;
  };
  bonds: Bonds;
}

interface Bonds {
  [space_id: number]: { [player_id: number]: number[] };
}
