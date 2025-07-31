class Utils {
  private readonly game: Azure;
  constructor(game: Azure) {
    this.game = game;
  }

  performAction(
    actionName: ActionName,
    args?: any,
    params?: { lock: boolean; checkAction: boolean }
  ) {
    this.game.bgaPerformAction(actionName, args, params);
  }

  addConfirmationButton(
    label: string,
    callback: () => void,
    params?: {
      color: "primary" | "secondary" | "alert";
      destination: HTMLElement;
      classes: string[];
    }
  ) {
    this.game.statusBar.addActionButton(
      label,
      () => {
        callback();
      },
      {
        id: `azr_confirmationBtn`,
        autoclick: true,
        ...params,
      }
    );
  }

  removeConfirmationButton() {
    document.getElementById(`azr_confirmationBtn`)?.remove();
  }
}

type ActionName = "act_placeStone";
