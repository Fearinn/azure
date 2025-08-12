class Qi extends QiManager {
  readonly card: QiCard;
  readonly id: number;
  readonly domain_id: number;
  private readonly deck_id: string;

  constructor(game: Azure, card: QiCard) {
    super(game);
    this.card = new AzureCard(card);
    this.domain_id = this.card.type_arg;
    this.deck_id = `deck-${this.domain_id}`;
  }

  setup(): void {
    this.stocks.decks[this.card.location].addCard(this.card);
  }

  async discard(player_id: number): Promise<void> {
    const fromElement =
      player_id === this.game.player_id
        ? undefined
        : document.getElementById(`azr_handIcon-${player_id}`);

    await this.stocks.decks[this.deck_id].addCard(this.card, {
      fromElement: fromElement,
    });
  }

  async gather(player_id: number): Promise<void> {
    if (player_id === this.game.player_id) {
      await this.stocks.hand.addCard(this.card, {
        fromStock: this.stocks.decks[this.deck_id],
      });
      return;
    }

    await this.stocks.decks[this.deck_id].removeCard(this.card, {
      slideTo: document.getElementById(`azr_handIcon-${player_id}`),
    });
  }

  async drawPrivate(): Promise<void> {
    await this.stocks.hand.addCard(this.card, {
      fromStock: this.stocks.decks["deck-0"],
    });
  }
}
