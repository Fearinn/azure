interface Space {
  id: number;
  card: SpaceCard;
}

class Space extends SpaceManager implements Space {
  constructor(game: Azure, card: SpaceCard) {
    super(game);
    this.card = card;
    this.id = this.card.id;
  }

  setup(): void {
    this.stocks.realm.addCard(this.card, {}, {});
  }
}
