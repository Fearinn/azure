interface AzurePlayer extends Player {}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {
  BEASTS: BeastInfo;
  managers: {
    beasts?: CardManager<BeastCard>;
    qi?: CardManager<QiCard>;
    spaces?: CardManager<SpaceCard>;
    stones?: CardManager<StoneCard>;
    wisdom?: CardManager<WisdomCard>;
  };
  stocks: {
    beasts?: BeastStocks;
    spaces?: {
      realm: CardStock<SpaceCard>;
    };
    qi?: QiStocks;
    stones?: {
      void: CardStock<StoneCard>;
      realm: CardStock<StoneCard>;
    };
    wisdom?: {
      [score: number]: CardStock<WisdomCard>;
    };
  };
  counters: {
    [player_id: number]: {
      hand: Counter;
      stones: Counter;
    };
  };
  realm: {
    [x: number]: {
      [y: number]: number;
    };
  };
  domainsOrder: number[];
  domainsRotations: {
    [domain_id: number]: number;
  };
  domainsSides: {
    [domain_id: number]: number;
  };
  placedBeasts: BeastCard[];
  activeBeasts: BeastCard[];
  decksCounts: {
    [domain_id: number]: number;
  };
  hand: QiCard[];
  handsCounts: {
    [player_id: number]: number;
  };
  stoneCounts: {
    [player_id: number]: number;
  };
  placedStones: StoneCard[];
}

interface AzureGui extends Game {
  notifqueue: {
    setIgnoreNotificationCheck(
      notif_name: string,
      predicate: (notif: Notif) => boolean
    ): void;
  };
}
