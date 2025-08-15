interface Beast {
  id: number;
  space_id: number;
  card: BeastCard;
  info: BeastInfo;
}

interface BeastInfo {
  label: string;
  guard: string;
  favor: string;
}

class Beast extends BeastManager implements Beast {
  constructor(game: Azure, card: BeastCard) {
    super(game);
    this.card = new AzureCard(card) as BeastCard;
    this.id = this.card.type_arg;
    this.space_id = Number(this.card.type);

    const info = this.gamedatas.BEASTS[this.id];
    info.label = _(info.label);
    info.guard = _(info.guard);
    info.favor = _(info.favor);

    this.info = info;
  }

  public setup(): void {
    const { location, location_arg: player_id } = this.card;
    if (location === "favors") {
      this.gainFavor(player_id);
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

  public async gainFavor(player_id: number): Promise<void> {
    await this.stocks[player_id].favors.addCard(this.card);
  }

  public buildTooltip(): string {
    const { label, guard, favor } = this.info;

    const formattedGuard = this.game.format_string_recursive(
      _("Guarded by ${guard}"),
      {
        guard,
      }
    );

    const formattedFavor = this.game.format_string_recursive(
      _("Favor: ${favor}"),
      {
        favor,
      }
    );

    const tooltip = `<div class="azr_customFont-body azr_beastTooltip">
    <span class="azr_beastTooltipTitle azr_customFont-title">${label}</span>
    <span>${formattedGuard}</span>
    <span>${formattedFavor}</span>
    </div>`;

    return tooltip;
  }
}
