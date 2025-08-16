interface QiInfo {
  label: string;
}

class Qi extends QiManager {
  readonly card: QiCard;
  readonly domain_id: number;
  private readonly info: QiInfo;
  private readonly deck_id: string;

  constructor(game: Azure, card: QiCard) {
    super(game);
    this.card = new AzureCard(card);
    this.domain_id = this.card.type_arg;
    this.deck_id = `deck-${this.domain_id}`;

    if (this.domain_id > 0) {
      const info = this.gamedatas.QI[this.domain_id];
      info.label = _(info.label);
      this.info = info;
    }
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

  buildTooltip(): string {
    if (Number.isNaN(this.domain_id)) {
      return;
    }

    const label =
      this.domain_id === 0
        ? _("Hidden deck")
        : this.game.format_string_recursive(_("${qi_label} qi"), {
            i18n: "qi_label",
            qi_label: this.info.label,
          });

    const tooltip = `
      <div class="azr_tooltip azr_qiTooltip"><span class="azr_qiTooltipTitle">${label}</span></div>
    `;

    return tooltip;
  }
}
