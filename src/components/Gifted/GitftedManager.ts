interface GiftedCard {
  id: number;
  label: string;
  description: string;
}

interface GiftedStocks {
  table: CardStock<GiftedCard>;
}

class GiftedManager {
  protected readonly game: Azure;
  protected readonly gamedatas: AzureGamedatas;
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

        const cloneElement = element.cloneNode(true) as HTMLElement;
        cloneElement.removeAttribute("id");

        this.game.addTooltipHtml(
          element.id,
          `<div class="azr_tooltip azr_giftedCardTooltip">${cloneElement.outerHTML}</div>`
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

  public highlight(highlight: boolean): void {
    this.stocks.table
      .getCardElement(this.card)
      .classList.toggle("azr_giftedCard-highlight", highlight);
  }
}
