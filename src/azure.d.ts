interface AzurePlayer extends Player {}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {
  managers: {
    beasts?: CardManager<BeastCard>;
    qi?: CardManager<QiCard>;
    spaces?: CardManager<SpaceCard>;
    stones?: CardManager<StoneCard>;
  };
  stocks: {
    beasts?: {
      realm: CardStock<BeastCard>;
    };
    spaces?: {
      realm: CardStock<SpaceCard>;
    };
    qi?: QiStocks;
    stones?: {
      realm: CardStock<StoneCard>;
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
  mountains: BeastCard[];
  decksCounts: {
    [domain_id: number]: number;
  };
  decks: { [domain_id: number]: QiCard[] };
  hand: QiCard[];
  handsCounts: {
    [player_id: number]: number;
  };
  stoneCounts: {
    [player_id: number]: number;
  };
  placedStones: StoneCard[];
}

interface AzureGui extends Game {}
