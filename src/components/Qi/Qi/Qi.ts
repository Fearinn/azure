interface Qi {
  id: number;
}

class Qi extends QiManager {
  card: QiCard;

  constructor(game: Azure, card: QiCard) {
    super(game);
    this.card = card;
  }

  setup(): void {
    this.stocks.decks[this.card.location].addCard(this.card);
  }

  getStock(): CardStock<QiCard> {
    return this.manager.getCardStock(this.card);
  }
}
