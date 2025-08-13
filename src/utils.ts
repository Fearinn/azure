class Utils {
  private readonly game: Azure;
  private readonly gamedatas: AzureGamedatas;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
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
        ...params,
      }
    );
  }

  removeConfirmationButton() {
    document.getElementById(`azr_confirmationBtn`)?.remove();
  }

  private rgbToHex(color: string): "003a4f" | "c1e8fb" {
    if (color.includes("rbg")) {
      return color as "003a4f" | "c1e8fb";
    }

    return color === "rgb(0, 58, 79)" ? "003a4f" : "c1e8fb";
  }

  getOppColor(color: string): "003a4f" | "c1e8fb" {
    return color === "003a4f" ? "c1e8fb" : "003a4f";
  }

  stylePlayerName(element: HTMLElement): void {
    const color = this.rgbToHex(element.style.color);
    const opp_color = this.getOppColor(color);

    element.style.setProperty("--color", `#${color}`);
    element.style.setProperty("--opp-color", `#${opp_color}`);
  }

  bgaFormatText(log: string, args: any): { log: string; args: any } {
    try {
      if (log && args && !args.processed) {
        if (args.space_icon !== undefined && args.space_id !== undefined) {
          const backgroundImage = `url(${g_gamethemeurl}img/spaces/space_${args.space_id}.jpg)`;
          args.space_icon = `<div class="azr_logIcon azr_spaceIcon" style="background-image: ${backgroundImage};"></div>`;
        }
      }
    } catch (e) {
      console.error(log, args, "Exception thrown", e.stack);
    }

    return { log, args };
  }
}

type ActionName = "act_placeStone" | "act_birdDiscard";
