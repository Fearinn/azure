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
    this.space_id = Number(this.card.type);
    this.id = this.card.type_arg;
  }

  setup(): void {
    const { location, location_arg: player_id } = this.card;
    if (location === "favors") {
      this.stocks[player_id].favors.addCard(this.card);
    }

    if (location === "realm") {
      this.stocks.realm.addCard(
        this.card,
        {},
        {
          forceToElement: document.getElementById(`azr_space-${this.space_id}`),
        }
      );
      return;
    }
  }
}
