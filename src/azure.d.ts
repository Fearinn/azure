interface AzurePlayer extends Player {}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {
  BEASTS: BeastInfo;
  QI: QiInfo;
  managers: {
    beasts?: CardManager<BeastCard>;
    qi?: CardManager<QiCard>;
    spaces?: CardManager<SpaceCard>;
    stones?: CardManager<StoneCard>;
    wisdom?: CardManager<WisdomCard>;
    gifted?: CardManager<GiftedCard>;
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
    gifted?: GiftedStocks;
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
  giftedCard: GiftedCard;
}

interface AzureGui extends Game {
  notifqueue: {
    setIgnoreNotificationCheck(
      notif_name: string,
      predicate: (notif: Notif) => boolean
    ): void;
  };
}

interface AutofitSettings {
  scaleStep?: number;
  minScale?: number;
}
interface AutofitWithObserverSettings extends AutofitSettings {
  rootElement?: HTMLElement;
}
/**
 * Auto-scale the content of divs with a `bga-autofit` class. Those divs should have a fixed width and height.
 * @param settings settings, width default : { scaleStep: 0.05, minScale: 0.1 }
 */
declare function init(settings?: AutofitWithObserverSettings): void;

declare const BgaAutofit: {
  init: typeof init;
};
