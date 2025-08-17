interface GiftedCard {
  id: number;
  label: string;
  description: string;
}

interface GiftedStocks {
  table: CardStock<GiftedCard>;
}

class GiftedManager {
  public readonly game: Azure;
  public readonly gamedatas: AzureGamedatas;
  protected manager: CardManager<GiftedCard>;
  protected stocks: GiftedStocks;
  protected readonly card: GiftedCard;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.gifted;
    this.stocks = this.gamedatas.stocks.gifted;

    this.card = this.gamedatas.giftedCard;
  }

  private create(): void {
    const manager = new CardManager<GiftedCard>(this.game, {
      getId: ({ id }) => {
        return `azr_giftedCard-${id}`;
      },
      setupDiv: ({ id }, element) => {
        element.classList.add("azr_card", "azr_giftedCard");
        element.style.backgroundImage = `url(${g_gamethemeurl}img/giftedCard_${id}.jpg)`;

        const { label, description } = this.card;

        element.insertAdjacentHTML(
          "beforeend",
          `<span class="bga-autofit azr_giftedCardTitle">${_(label)}</span>
          <span class="bga-autofit azr_giftedCardDescription">${_(
            description
          )}</span>`
        );
      },
    });

    this.gamedatas.managers.gifted = manager;
    this.manager = manager;

    const stocks: GiftedStocks = {
      table: new CardStock<GiftedCard>(
        manager,
        document.getElementById(`azr_giftedContainer`)
      ),
    };

    this.gamedatas.stocks.gifted = stocks;
    this.stocks = stocks;
  }

  private setupStocks(): void {
    if (!this.card) {
      return;
    }

    this.stocks.table.addCard(this.card);
  }

  public setup(): void {
    this.create();
    this.setupStocks();
  }
}
