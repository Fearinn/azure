interface AzurePlayer extends Player {}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {
  managers: {
    beasts?: CardManager<BeastCard>;
    qi?: CardManager<QiCard>;
  };
  stocks: {
    beasts?: {
      realm: CardStock<BeastCard>;
    };
    qi?: QiStocks;
  };
  counters: {
    [player_id: number]: {
      hand: Counter;
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
}

interface AzureGui extends Game {}

interface AzureCard {
  id: number;
  type: string;
  type_arg?: number;
  location: string;
  location_arg: number;
}
