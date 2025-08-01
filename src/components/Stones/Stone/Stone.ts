class Stone extends StoneManager implements Stone {
  readonly card: StoneCard;

  constructor(game: Azure, card: StoneCard) {
    super(game);
    this.card = new AzureCard(card) as StoneCard;
  }

  setup(): void {
    const { location_arg: space_id } = this.card;

    this.stocks.realm.addCard(
      this.card,
      {},
      {
        forceToElement: document.getElementById(`azr_space-${space_id}`),
      }
    );
  }

  async place(player_id: number, space_id: number): Promise<void> {
    this.gamedatas.counters[player_id].stones.incValue(-1);

    await this.stocks.realm.addCard(
      this.card,
      { fromElement: document.getElementById(`azr_stoneIcon-${player_id}`) },
      { forceToElement: document.getElementById(`azr_space-${space_id}`) }
    );
  }
}
