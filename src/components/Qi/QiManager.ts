interface QiCard extends AzureCard {}

interface QiStocks {
  decks: { [domain_id: number]: Deck<QiCard> };
}

class QiManager {
  private game: Azure;
  private gamedatas: AzureGamedatas;
  public manager: CardManager<QiCard>;
  public stocks: QiStocks;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.qi;
    this.stocks = this.gamedatas.stocks.qi;
  }

  create(): void {
    const manager = new CardManager<QiCard>(this.game, {
      cardHeight: 228,
      cardWidth: 150,
      getId: ({ type_arg }) => {
        return `azr_qi-${type_arg}`;
      },

      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: ({ type_arg }, element) => {
        element.classList.add(`azr_qi`);
      },
      setupFrontDiv: ({ type_arg }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/qi_${type_arg}.jpg)`;
      },
      setupBackDiv: ({ type_arg }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/qi_0.jpg)`;
      },
    });

    const { decksCounts } = this.gamedatas;

    let decks = {};

    for (const d_id in decksCounts) {
      const domain_id = Number(d_id);

      if (domain_id === 0) {
        continue;
      }

      const deck = new Deck(
        manager,
        document.getElementById(`azr_deck-${domain_id}`),
        {
          counter: {
            extraClasses: "text-shadow",
            position: "bottom",
          },
        }
      );

      decks = {
        ...decks,
        [domain_id]: deck,
      };
    }

    this.gamedatas.stocks.qi = {
      decks,
    };

    this.gamedatas.managers.qi = manager;
  }

  setupStocks(): void {
    const { decks } = this.gamedatas;

    for (const domain_id in decks) {
      const deck = decks[domain_id];
      deck.forEach((card) => {
        const qi = new Qi(this.game, card);
        qi.setup();
      });
    }
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }
}
