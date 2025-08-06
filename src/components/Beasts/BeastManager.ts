interface BeastCard extends AzureCard {
  type_arg: number;
}

class BeastManager {
  private game: Azure;
  private gamedatas: AzureGamedatas;
  public manager: CardManager<BeastCard>;
  public stocks: { realm: CardStock<BeastCard> };

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.beasts;
    this.stocks = this.gamedatas.stocks.beasts;
  }

  create(): void {
    const manager = new CardManager<BeastCard>(this.game, {
      getId: ({ type_arg }) => {
        return `azr_beast-${type_arg}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: ({ type_arg }, element) => {
        element.classList.add(`azr_beast`);
        element.style.backgroundImage = `url(${g_gamethemeurl}img/beast_${type_arg}.png)`;
      },
    });

    this.gamedatas.stocks.beasts = {
      realm: new CardStock<BeastCard>(
        manager,
        document.getElementById(`azr_beasts`),
        {}
      ),
    };

    this.gamedatas.managers.beasts = manager;
  }

  setupStocks(): void {
    const { placedBeasts } = this.gamedatas;
    placedBeasts.forEach((card) => {
      const beast = new Beast(this.game, card);
      beast.setup();
    });
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }
}
