class StPlayerTurn extends StateManager {
  constructor(game: Azure) {
    super(game);
  }

  enter(args: arg_playerTurn) {
    const { _private } = args;
    const spaceManager = new SpaceManager(this.game);
    spaceManager.makeSelectable(_private.selectableSpaces);
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
