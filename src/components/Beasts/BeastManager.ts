interface BeastCard {
  id: number;
  x: number;
  y: number;
  space_id: number;
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
      getId: ({ id }) => {
        return `azr_beast-${id}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: ({ id }, element) => {
        element.classList.add(`azr_beast`);
        element.style.backgroundImage = `url(${g_gamethemeurl}img/beast_${id}.png)`;
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
    const { beastCards } = this.gamedatas;
    beastCards.forEach((card) => {
      const beast = new Beast(this.game, card);
      beast.setup();
    });

    console.log(beastCards);
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }
}
