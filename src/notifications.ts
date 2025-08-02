class NotifManager {
  private readonly game: Azure;
  private readonly gamedatas: AzureGamedatas;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;
  }

  async notif_discardQi(
    args: NotifArgs & {
      card: QiCard;
    }
  ): Promise<void> {
    const { player_id, card } = args;
    const qi = new Qi(this.game, card);
    await qi.discard(player_id);
  }

  async notif_gatherQi(
    args: NotifArgs & {
      cards: QiCard[];
    }
  ): Promise<void> {
    const { player_id, cards } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.gather(player_id, cards);
  }

  async notif_placeStone(
    args: NotifArgs & { card: StoneCard; space_id: number }
  ) {
    const { player_id, space_id, card } = args;
    const stone = new Stone(this.game, card);
    await stone.place(player_id, space_id);
  }

  async notif_incScore(
    args: NotifArgs & {
      initialScore: number;
      finalScore: number;
    }
  ): Promise<void> {
    const { initialScore, finalScore, player_id } = args;
    this.game.scoreCtrl[player_id].toValue(finalScore);

    const wisdomManager = new WisdomManager(this.game);
    await wisdomManager.setScore(player_id, initialScore, finalScore);
  }
}

interface NotifArgs {
  player_id: number;
}
