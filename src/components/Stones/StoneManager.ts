interface StoneCard extends AzureCard {
  type_arg: number;
}

class StoneManager {
  public readonly game: Azure;
  public readonly gamedatas: AzureGamedatas;
  public readonly manager: CardManager<StoneCard>;
  public readonly stocks: {
    realm: CardStock<StoneCard>;
    void: CardStock<StoneCard>;
  };

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.stones;
    this.stocks = this.gamedatas.stocks.stones;
  }

  private create(): void {
    const manager = new CardManager<StoneCard>(this.game, {
      getId: ({ id }) => {
        return `azr_stone-${id}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: (card, element) => {
        element.classList.add(`azr_stone`);

        const { type_arg: player_id } = card;
        const { color } = this.gamedatas.players[player_id];
        element.classList.add(`azr_stone-${color}`);

        const stone = new Stone(this.game, card);
        const tooltip = stone.buildTooltip();
        this.game.addTooltipHtml(element.id, tooltip);
      },
    });

    this.gamedatas.stocks.stones = {
      realm: new CardStock<StoneCard>(
        manager,
        document.getElementById(`azr_stones`),
        {}
      ),
      void: new VoidStock<StoneCard>(
        manager,
        document.getElementById(`azr_stonesVoid`)
      ),
    };

    this.gamedatas.managers.stones = manager;
  }

  private setupStocks(): void {
    const { placedStones } = this.gamedatas;
    placedStones.forEach((stoneCard) => {
      const stone = new Stone(this.game, stoneCard);
      stone.setup();
    });
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }
}
