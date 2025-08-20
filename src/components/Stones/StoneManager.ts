interface StoneCard extends AzureCard {
  type_arg: number;
  type: "common" | "gifted";
  location: "hand" | "realm" | "gifted";
}

interface StoneStocks {
  void: VoidStock<StoneCard>;
  realm: CardStock<StoneCard>;
  [player_id: number]: {
    gifted: CardStock<StoneCard>;
  };
}

class StoneManager {
  protected readonly game: Azure;
  protected readonly gamedatas: AzureGamedatas;
  protected readonly manager: CardManager<StoneCard>;
  protected readonly stocks: StoneStocks;

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
        element.classList.add("azr_card", "azr_stone");

        const { type_arg: player_id, type } = card;
        const { color } = this.gamedatas.players[player_id];
        element.classList.add(`azr_stone-${color}`);

        if (type === "gifted") {
          element.classList.add("azr_stone-gifted");
          
          element.style.setProperty(
            "--gifted-bg",
            `url(${g_gamethemeurl}img/giftedStone_${color}.png)`
          );
        }

        const stone = new Stone(this.game, card);
        const tooltip = stone.buildTooltip();
        this.game.addTooltipHtml(element.id, tooltip);
      },
    });

    let stocks: StoneStocks = {
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

    for (const player_id in this.gamedatas.players) {
      stocks = {
        ...stocks,
        [player_id]: {
          gifted: new CardStock<StoneCard>(
            manager,
            document.getElementById(`azr_giftedStone-${player_id}`)
          ),
        },
      };
    }

    this.gamedatas.stocks.stones = stocks;
    this.gamedatas.managers.stones = manager;
  }

  private setupStocks(): void {
    const { placedStones, giftedStones } = this.gamedatas;
    [...placedStones, ...giftedStones].forEach((stoneCard) => {
      const stone = new Stone(this.game, stoneCard);
      stone.setup();
    });
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }
}
