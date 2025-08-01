interface Beast {
  id: number;
  active: boolean;
}

class Beast extends BeastManager {
  card: BeastCard;

  constructor(game: Azure, card: BeastCard) {
    super(game);
    this.card = card;
  }

  setup(): void {
    this.stocks.realm.addCard(
      this.card,
      {},
      {
        forceToElement: document.getElementById(`azr_space-${this.card.space_id}`),
      }
    );
  }
}
