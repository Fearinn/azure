interface AzurePlayer extends Player {}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {
  managers: {
    beasts?: CardManager<BeastCard>;
  };
  stocks: {
    beasts?: {
      realm: CardStock<BeastCard>;
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
}

interface AzureGui extends Game {}

interface AzureCard {
  id: number;
  type: string;
  type_arg?: number;
  location: string;
  location_arg: number;
}