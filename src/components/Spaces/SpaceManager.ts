interface SpaceCard {
  id: number;
  x?: number;
  y?: number;
}

class SpaceManager {
  protected game: Azure;
  protected gamedatas: AzureGamedatas;
  protected readonly manager: CardManager<SpaceCard>;
  protected readonly stocks: { realm: CardStock<SpaceCard> };
  protected readonly bonds: Bonds;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.spaces;
    this.stocks = this.gamedatas.stocks.spaces;
    this.bonds = this.gamedatas.bonds;
  }

  private create(): void {
    const manager = new CardManager<SpaceCard>(this.game, {
      getId: ({ id }) => {
        return `azr_space-${id}`;
      },
      selectedCardClass: `azr_selected`,
      selectableCardClass: `azr_selectable`,
      unselectableCardClass: `azr_unselectable`,
      setupDiv: (card, element) => {
        const { x, y } = card;
        element.classList.add(`azr_space`);
        element.style.setProperty("--x", x.toString());
        element.style.setProperty("--y", y.toString());

        const space = new Space(this.game, card);
        space.highlightBonds();
      },
    });

    this.gamedatas.stocks.spaces = {
      realm: new CardStock<SpaceCard>(
        manager,
        document.getElementById(`azr_spaces`),
        {}
      ),
    };

    this.gamedatas.managers.spaces = manager;
  }

  private setupStocks(): void {
    const { realm } = this.gamedatas;
    for (const x in realm) {
      for (const y in realm[x]) {
        const space_id = realm[x][y];
        const spaceCard: SpaceCard = {
          id: space_id,
          x: Number(x),
          y: Number(y),
        };

        const space = new Space(this.game, spaceCard);
        space.setup();
      }
    }
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }

  makeSelectable(
    selectableSpaces?: SpaceCard[],
    action: ActionName = "act_placeStone"
  ): void {
    this.stocks.realm.setSelectionMode("single");
    this.stocks.realm.setSelectableCards(selectableSpaces);

    this.stocks.realm.onSelectionChange = (selection, card) => {
      const utils = new Utils(this.game);

      utils.removeConfirmationButton();

      if (selection.length === 0) {
        return;
      }

      const { x, y, id: space_id } = card;

      if (this.game.getGameUserPreference(101) === 0) {
        utils.performAction(action, { x, y });
        return;
      }

      utils.addConfirmationButton(
        this.game.format_string_recursive("${space_icon}", {
          space_icon: "",
          space_id,
        }),
        () => {
          utils.performAction(action, { x, y });
        }
      );
    };
  }

  makeUnselectable(): void {
    this.stocks.realm.setSelectionMode("none");
  }

  highlightBonds(): void {
    for (const sp_id in this.bonds) {
      const space_id = Number(sp_id);
      const space = new Space(this.game, { id: space_id });
      space.highlightBonds();
    }
  }
}
