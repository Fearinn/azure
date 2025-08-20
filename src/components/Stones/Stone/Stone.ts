class Stone extends StoneManager implements Stone {
  readonly card: StoneCard;
  private readonly player_id: number;

  constructor(game: Azure, card: StoneCard) {
    super(game);
    this.card = new AzureCard(card) as StoneCard;
    this.player_id = this.card.type_arg;
  }

  public setup(): void {
    const { location, location_arg: space_id } = this.card;

    if (location === "realm") {
      this.stocks.realm.addCard(
        this.card,
        {},
        {
          forceToElement: document.getElementById(`azr_space-${space_id}`),
        }
      );
      return;
    }

    this.stocks[this.player_id].gifted.addCard(this.card);
  }

  public async place(player_id: number, space_id: number): Promise<void> {
    this.gamedatas.counters[player_id].stones.incValue(-1);

    await this.stocks.realm.addCard(
      this.card,
      { fromElement: document.getElementById(`azr_stoneIcon-${player_id}`) },
      { forceToElement: document.getElementById(`azr_space-${space_id}`) }
    );
  }

  public async remove(player_id: number): Promise<void> {
    this.gamedatas.counters[player_id].stones.incValue(1);
    await this.stocks.void.addCard(this.card);
  }

  public buildTooltip(): string {
    const { name, color } = this.gamedatas.players[this.player_id];

    const label = this.game.format_string_recursive(
      _("${player_name}'s ${common_or_gifted} stone"),
      {
        common_or_gifted:
          this.card.type === "common" ? _("common") : _("gifted"),
        player_name: name,
      }
    );

    const utils = new Utils(this.game);
    const opp_color = utils.getOppColor(color);

    const tooltip = `<div class="azr_tooltip azr_stoneTooltip" style="--color: #${color}; --opp-color: #${opp_color}">
    <span>${label}</span></div>`;
    return tooltip;
  }
}
