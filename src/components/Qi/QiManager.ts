interface QiCard extends AzureCard {}

interface QiStocks {
  decks: { [deck_id: string]: Deck<QiCard> };
  hand: HandStock<QiCard>;
}

class QiManager {
  public readonly game: Azure;
  public readonly gamedatas: AzureGamedatas;
  public manager: CardManager<QiCard>;
  public stocks: QiStocks;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.stocks = this.gamedatas.stocks.qi;
    this.manager = this.gamedatas.managers.qi;
  }

  create(): void {
    const manager = new CardManager<QiCard>(this.game, {
      cardHeight: 228,
      cardWidth: 150,
      getId: ({ id }) => {
        return `azr_qi-${id}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: (_, element) => {
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

      const deck = new Deck(
        manager,
        document.getElementById(`azr_deck-${domain_id}`),
        {
          counter: {
            extraClasses: "text-shadow azr_deckCounter",
            position: "top",
          },
        }
      );

      decks = {
        ...decks,
        [`deck-${domain_id}`]: deck,
      };
    }

    this.gamedatas.stocks.qi = {
      decks,
      hand: new HandStock(manager, document.getElementById(`azr_hand`), {
        cardShift: "8px",
        cardOverlap: "80px",
        sort: sortFunction("type_arg"),
      }),
    };

    this.gamedatas.managers.qi = manager;

    this.stocks = this.gamedatas.stocks.qi;
    this.manager = manager;
  }

  setupStocks(): void {
    const { decks, hand } = this.gamedatas;

    for (const domain_id in decks) {
      const deck = decks[domain_id];
      deck.forEach((card) => {
        const qi = new Qi(this.game, card);
        qi.setup();
      });
    }

    if (!this.game.isSpectator) {
      this.stocks.hand.addCards(hand);
    }
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }

  async gather(player_id: number, cards: QiCard[]): Promise<void> {
    const promises = [];
    cards.forEach((card) => {
      const qi = new Qi(this.game, card);
      qi.gather(player_id);
    });

    await Promise.all(promises);
  }
}
