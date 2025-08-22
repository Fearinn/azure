class NotifManager {
  private readonly game: Azure;
  private readonly gamedatas: AzureGamedatas;

  constructor(game: Azure) {
    this.game = game;
    this.gamedatas = this.game.gamedatas;

    game.notifqueue.setIgnoreNotificationCheck("drawQi", (notif) => {
      const { player_id, isPrivate } = notif.args;
      return player_id === this.game.player_id;
    });
  }

  async notif_discardQi(
    args: NotifArgs & {
      cards: QiCard[];
      handCount: number;
    }
  ): Promise<void> {
    const { player_id, cards, handCount } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.discard(player_id, cards, handCount);
  }

  async notif_gatherQi(
    args: NotifArgs & {
      cards: QiCard[];
      handCount: number;
    }
  ): Promise<void> {
    const { player_id, cards, handCount } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.gather(player_id, cards, handCount);
  }

  async notif_drawQi(args: NotifArgs & { nbr: number; handCount: number }) {
    const { player_id, nbr, handCount } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.draw(player_id, nbr, handCount);
  }

  async notif_drawQiPrivate(
    args: NotifArgs & { cards: QiCard[]; handCount: number }
  ) {
    const { player_id, cards, handCount } = args;
    const qiManager = new QiManager(this.game);
    await qiManager.drawPrivate(player_id, cards, handCount);
  }

  async notif_placeStone(
    args: NotifArgs & { card: StoneCard; space_id: number }
  ): Promise<void> {
    const { player_id, space_id, card } = args;
    const stone = new Stone(this.game, card);
    await stone.place(player_id, space_id);
  }
  
  async notif_removeStone(
    args: NotifArgs & { card: StoneCard; space_id: number }
  ): Promise<void> {
    const { player_id, card } = args;
    const stone = new Stone(this.game, card);
    await stone.remove(player_id);
  }

  async notif_gainFavor(args: NotifArgs & { card: BeastCard }): Promise<void> {
    const { card, player_id } = args;
    const beast = new Beast(this.game, card);
    await beast.gainFavor(player_id);
  }

  notif_setScore(
    args: NotifArgs & {
      score: number;
    }
  ): void {
    const { player_id, score } = args;
    this.game.scoreCtrl[player_id].toValue(score);
  }

  async notif_gatherWisdom(
    args: NotifArgs & { initialWisdom: number; finalWisdom: number }
  ) {
    const { player_id, initialWisdom, finalWisdom } = args;
    const wisdomManager = new WisdomManager(this.game);
    await wisdomManager.set(player_id, initialWisdom, finalWisdom);
  }
}

interface NotifArgs {
  player_id: number;
}
