class StateManager {
  readonly game: Azure;

  constructor(game: Azure) {
    this.game = game;
  }

  onEntering(stateName: StateName, args: any) {
    if (!this.game.isCurrentPlayerActive()) {
      return;
    }

    switch (stateName) {
      case "playerTurn":
        new StPlayerTurn(this.game).enter(args);
        break;
    }
  }
}

type StateName = "playerTurn";
