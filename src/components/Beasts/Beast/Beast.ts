interface Beast {
  id: number;
  active: boolean;
  space_id: number;
  card: BeastCard;
}

class Beast extends BeastManager implements Beast {
  constructor(game: Azure, card: BeastCard) {
    super(game);
    this.card = new AzureCard(card) as BeastCard;
    this.space_id = this.card.location_arg;
    this.id = this.card.type_arg;
  }

  setup(): void {
    this.stocks.realm.addCard(
      this.card,
      {},
      {
        forceToElement: document.getElementById(`azr_space-${this.space_id}`),
      }
    );
  }
}
