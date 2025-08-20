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

      case "birdDiscard":
        new StBirdDiscard(this.game).enter(args);
        break;

      case "client_placeGifted":
        new StPlaceGifted(this.game).enter(args);
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

      case "birdDiscard":
        new StBirdDiscard(this.game).leave();
        break;

      case "client_placeGifted":
        new StPlaceGifted(this.game).leave();
        break;
    }
  }
}

type StateName = "playerTurn" | "birdDiscard" | "client_placeGifted";
