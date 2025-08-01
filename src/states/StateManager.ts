class StateManager {
  readonly game: Azure;

  constructor(game: Azure) {
    this.game = game;
  }

  onEntering(stateName: StateName, args: any): void {
    if (!this.game.isCurrentPlayerActive()) {
      return;
    }

    switch (stateName) {
      case "playerTurn":
        new StPlayerTurn(this.game).enter(args);
        break;
    }
  }

  onLeaving(stateName: StateName): void {
    if (!this.game.isCurrentPlayerActive()) {
      return;
    }

    switch (stateName) {
      case "playerTurn":
        new StPlayerTurn(this.game).leave();
        break;
    }
  }
}

type StateName = "playerTurn";
