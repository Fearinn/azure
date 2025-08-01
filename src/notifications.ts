class NotifManager {
  game: Azure;

  constructor(game: Azure) {
    this.game = game;
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
      score: number;
    }
  ): Promise<void> {
    const { score, player_id } = args;
    this.game.scoreCtrl[player_id].incValue(score);
  }
}

interface NotifArgs {
  player_id: number;
}
