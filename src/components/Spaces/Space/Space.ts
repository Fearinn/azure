interface Space {
  id: number;
  card: SpaceCard;
  timeout: number | null;
}

class Space extends SpaceManager implements Space {
  constructor(game: Azure, card: SpaceCard) {
    super(game);
    this.card = card;
    this.id = this.card.id;
    this.timeout = null;
  }

  setup(): void {
    this.stocks.realm.addCard(this.card, {}, {});
  }

  enterHover(): void {
    if (this.game.getGameUserPreference(102) === 0) {
      return;
    }

    clearTimeout(this.timeout);
    const bonds = this.bonds[this.id];

    this.timeout = setTimeout(() => {
      for (const p_id in bonds) {
        const player_id = Number(p_id);

        bonds[player_id].forEach((space_id) => {
          const card = { id: space_id };
          const element = this.manager.getCardElement(card);

          const className =
            player_id === this.game.player_id
              ? "azr_space-bonded"
              : "azr_space-opponent";
          element.classList.add(className);
        });
      }
    }, 500);
  }

  leaveHover(): void {
    if (this.game.getGameUserPreference(102) === 0) {
      return;
    }

    clearTimeout(this.timeout);
    this.timeout = null;

    const bonds = this.bonds[this.id];

    for (const p_id in bonds) {
      const player_id = Number(p_id);

      bonds[player_id].forEach((space_id) => {
        const card = { id: space_id };
        const element = this.manager.getCardElement(card);
        element.classList.remove("azr_space-bonded", "azr_space-opponent");
      });
    }
  }

  highlightBonds(): void {
    const cardElement = this.manager.getCardElement(this.card);

    cardElement.addEventListener("mouseover", () => {
      this.enterHover();
    });

    cardElement.addEventListener("mouseout", () => {
      this.leaveHover();
    });

    cardElement.addEventListener(
      "touchstart",
      () => {
        this.enterHover();
      },
      { passive: true }
    );

    cardElement.addEventListener(
      "touchend",
      () => {
        this.leaveHover();
      },
      { passive: true }
    );

    cardElement.addEventListener(
      "touchcancel",
      () => {
        this.leaveHover();
      },
      { passive: true }
    );
  }
}
