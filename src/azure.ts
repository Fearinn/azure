// @ts-ignore
Game = (function () {
  // this hack required so we fake extend Game
  function Game() {}
  return Game;
})();

// Note: it does not really extend it in es6 way, you cannot call super you have to use dojo way
class Azure extends Game<AzureGamedatas> implements AzureGui {
  // @ts-ignore
  constructor() {}

  public setup(gamedatas: AzureGamedatas) {
    const template = new AzureTemplate(this, gamedatas);

    this.gamedatas.managers = {};
    this.gamedatas.stocks = {};

    template.setup();
    this.setupNotifications();
  }
  public onEnteringState(stateName: string, args: any) {}
  public onLeavingState(stateName: string) {}
  public onUpdateActionButtons(stateName: string, args: any) {}
  public setupNotifications() {}

  onGameUserPreferenceChanged = (pref_id: number, pref_value: number) => {
    switch (pref_id) {
      case 101:
        const handElement = document.getElementById(`azr_hand`);

        if (pref_value === 1) {
          document
            .getElementById(`bga-zoom-wrapper`)
            .insertAdjacentElement("beforebegin", handElement);
          break;
        }

        document
          .getElementById(`azr_gameArea`)
          .insertAdjacentElement("afterbegin", handElement);
        break;
    }
  };
}
