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
    console.log(this.id, "TEST");
    this.stocks.realm.addCard(
      this.card,
      {},
      {
        forceToElement: document.getElementById(`azr_space-${this.id}`),
      }
    );
  }

  getStock(): CardStock<SpaceCard> {
    return this.manager.getCardStock(this.card);
  }
}
