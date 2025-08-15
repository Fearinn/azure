interface QiCard extends AzureCard {}

interface QiStocks {
  decks: { [deck_id: string]: Deck<QiCard> };
  hand: CardStock<QiCard>;
  [player_id: number]: {
    void: VoidStock<QiCard>;
  };
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

  setupStocks(): void {
    const { hand } = this.gamedatas;

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

  async draw(player_id: number, nbr: number): Promise<void> {
    for (let i = 1; i <= nbr; i++) {
      const fakeCard = this.manager.getFakeCardGenerator()(`fake-${i}`);

      await this.stocks[player_id].void.addCard(fakeCard, {
        fromStock: this.stocks.decks["deck-0"],
      });
    }
  }

  async drawPrivate(cards: QiCard[]): Promise<void> {
    const promises = [];
    cards.forEach((card) => {
      const qi = new Qi(this.game, card);
      qi.drawPrivate();
    });

    await Promise.all(promises);
  }

  makeSelectable(): void {
    this.stocks.hand.setSelectionMode("multiple");

    this.stocks.hand.onSelectionChange = (selection) => {
      const utils = new Utils(this.game);
      utils.removeConfirmationButton();

      if (selection.length === 2) {
        utils.addConfirmationButton(_("confirm qi"), () => {
          utils.performAction("act_birdDiscard", {
            cards: JSON.stringify(selection),
          });
        });

        return;
      }

      if (selection.length > 2) {
        this.game.showMessage(_("You must discard exactly 2 qi"), "error");
        return;
      }
    };
  }

  makeUnselectable(): void {
    this.stocks.hand.setSelectionMode("none");
  }
}
