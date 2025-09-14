interface QiCard extends AzureCard {}

interface QiStocks {
  decks: { [deck_id: string]: Deck<QiCard> };
  hand: CardStock<QiCard>;
  [player_id: number]: {
    void: VoidStock<QiCard>;
  };
}

class QiManager {
  protected readonly game: Azure;
  protected readonly gamedatas: AzureGamedatas;
  protected manager: CardManager<QiCard>;
  protected stocks: QiStocks;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.stocks = this.gamedatas.stocks.qi;
    this.manager = this.gamedatas.managers.qi;
  }

  public create(): void {
    const manager = new CardManager<QiCard>(this.game, {
      cardHeight: 111 * 1.52,
      cardWidth: 111,
      getId: ({ id }) => {
        return `azr_qi-${id}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: (card, element) => {
        element.classList.add(`azr_qi`);
        const qi = new Qi(this.game, card);
        const tooltip = qi.buildTooltip();
        this.game.addTooltipHtml(element.id, tooltip);
      },
      setupFrontDiv: ({ type_arg }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/qi_${type_arg}.jpg)`;
      },
      setupBackDiv: ({ type_arg }, element) => {
        if (!type_arg) {
          type_arg = 0;
        }
        element.style.backgroundImage = `url(${g_gamethemeurl}img/qi_${type_arg}.jpg)`;
      },
    });

    const { decksCounts, hand } = this.gamedatas;

    let decks = {};

    for (const d_id in decksCounts) {
      const domain_id = Number(d_id);

      const deck = new Deck(
        manager,
        document.getElementById(`azr_deck-${domain_id}`),
        {
          fakeCardGenerator: (deck_id) => {
            const fakeCard = {
              id: -domain_id,
              type_arg: domain_id,
              type: "",
              location: deck_id,
              location_arg: 0,
            };

            return fakeCard;
          },
          cardNumber: decksCounts[domain_id],
          counter: {
            extraClasses: "azr_customFont-title azr_deckCounter",
            position: "bottom",
          },
        }
      );

      decks = {
        ...decks,
        [`deck-${domain_id}`]: deck,
      };
    }

    let stocks = {
      decks,
      hand: new CardStock(manager, document.getElementById(`azr_hand`), {
        sort: sortFunction("type_arg"),
      }),
    };

    for (const p_id in this.gamedatas.players) {
      const player_id = Number(p_id);

      stocks = {
        ...stocks,
        [player_id]: {
          void: new VoidStock(
            manager,
            document.getElementById(`azr_handIcon-${player_id}`)
          ),
        },
      };
    }

    this.gamedatas.stocks.qi = stocks;
    this.gamedatas.managers.qi = manager;

    this.stocks = this.gamedatas.stocks.qi;
    this.manager = manager;
  }

  private setupStocks(): void {
    const { hand } = this.gamedatas;

    if (!this.game.isSpectator) {
      this.stocks.hand.addCards(hand);
    }
  }

  public setup(): void {
    this.create();
    this.setupStocks();
  }

  public async gather(
    player_id: number,
    cards: QiCard[],
    handCount: number
  ): Promise<void> {
    for (const card of cards) {
      const qi = new Qi(this.game, card);
      await qi.gather(player_id);
    }

    this.updateHandCounter(player_id, handCount);
  }

  protected updateHandCounter(player_id: number, handCount: number): void {
    this.gamedatas.counters[player_id].hand.toValue(handCount);
  }

  public async draw(
    player_id: number,
    nbr: number,
    handCount: number
  ): Promise<void> {
    for (let i = 1; i <= nbr; i++) {
      const fakeCard = this.manager.getFakeCardGenerator()(`fake-${i}`);

      await this.stocks[player_id].void.addCard(fakeCard, {
        fromStock: this.stocks.decks["deck-0"],
      });
    }

    this.updateHandCounter(player_id, handCount);
  }

  public async drawPrivate(
    player_id: number,
    cards: QiCard[],
    handCount: number
  ): Promise<void> {
    for (const card of cards) {
      const qi = new Qi(this.game, card);
      await qi.drawPrivate();
    }

    this.updateHandCounter(player_id, handCount);
  }

  public async discard(player_id: number, cards: QiCard[], handCount: number) {
    for (const card of cards) {
      const qi = new Qi(this.game, card);
      await qi.discard(player_id);
    }

    this.updateHandCounter(player_id, handCount);
  }

  public makeSelectable(): void {
    this.stocks.hand.setSelectionMode("multiple");

    this.stocks.hand.onSelectionChange = (selection) => {
      const utils = new Utils(this.game);
      utils.removeConfirmationButton();

      if (selection.length === 2) {
        utils.addConfirmationButton(_("confirm cards"), () => {
          utils.performAction("act_birdDiscard", {
            cards: JSON.stringify(selection),
          });
        });

        return;
      }

      if (selection.length > 2) {
        this.game.showMessage(_("You must discard exactly 2 cards"), "error");
        return;
      }
    };
  }

  public makeUnselectable(): void {
    this.stocks.hand.setSelectionMode("none");
  }

  public async reshuffle(cardCounts: {
    [domain_id: number]: number;
  }): Promise<void> {
    for (const domain_id in cardCounts) {
      const cardCount = cardCounts[domain_id];

      for (let i = 1; i <= cardCount; i++) {
        const fakeCard = this.manager.getFakeCardGenerator()(
          `deck-${domain_id}-${i}`
        );

        await this.stocks.decks["deck-0"].addCard(fakeCard, {
          fromStock: this.stocks.decks[`deck-${domain_id}`],
        });
      }
    }
  }
}
