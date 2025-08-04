interface WisdomCard {
  id: number;
}

class WisdomManager {
  private game: Azure;
  public gamedatas: AzureGamedatas;
  public readonly manager: CardManager<WisdomCard>;
  public readonly stocks: { [score: number]: CardStock<WisdomCard> };

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
    this.manager = this.gamedatas.managers.wisdom;
    this.stocks = this.gamedatas.stocks.wisdom;
  }

  private create(): void {
    const manager = new CardManager<WisdomCard>(this.game, {
      getId: ({ id }) => {
        return `azr_wisdom-${id}`;
      },
      setupDiv: ({ id }, element) => {
        const { color } = this.gamedatas.players[id];
        element.classList.add(`azr_stone`, `azr_stone-${color}`, `azr_wisdom`);
      },
    });

    this.gamedatas.stocks.wisdom = {};

    for (let i = 1; i <= 25; i++) {
      this.gamedatas.stocks.wisdom[i] = new CardStock<WisdomCard>(
        manager,
        document.getElementById(`azr_wisdomTrack-${i}`),
        {}
      );
    }

    this.gamedatas.managers.wisdom = manager;
  }

  private setupStocks(): void {
    for (const p_id in this.gamedatas.players) {
      const player_id = Number(p_id);
      const { score: scr } = this.gamedatas.players[player_id];
      const score = Number(scr);

      if (!score) {
        continue;
      }

      this.gamedatas.stocks.wisdom[score].addCard({ id: player_id });
    }
  }

  setup(): void {
    this.create();
    this.setupStocks();
  }

  async setScore(
    player_id: number,
    initialScore: number,
    finalScore: number
  ): Promise<void> {
    await this.stocks[finalScore].addCard(
      { id: player_id },
      {
        fromElement:
          initialScore === 0
            ? document.getElementById(`azr_stoneIcon-${player_id}`)
            : undefined,
      }
    );
  }
}
