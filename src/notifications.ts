class NotifManager {
  game: Azure;

  constructor(game: Azure) {
    this.game = game;
  }

  async notif_discardQi(args: {
    player_id: number;
    card: QiCard;
  }): Promise<void> {
    const { player_id, card } = args;
    const qi = new Qi(this.game, card);
    await qi.discard(player_id);
  }

  async notif_gatherQi(args: {
    player_id: number;
    cards: QiCard[];
  }): Promise<void> {
    const { player_id, cards } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.gather(player_id, cards);
  }

  async notif_incScore(args: {
    player_id: number;
    score: number;
  }): Promise<void> {
    const { score, player_id } = args;
    this.game.scoreCtrl[player_id].incValue(score);
  }
}
