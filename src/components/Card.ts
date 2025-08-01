class AzureCard {
  readonly id: number;
  readonly type: string;
  readonly type_arg?: number;
  readonly location: string;
  readonly location_arg: number;

  constructor(card: AzureCard) {
    this.id = card.id;
    this.type = card.type;
    this.type_arg = Number(card.type_arg);
    this.location = card.location;
    this.location_arg = Number(card.location_arg);
  }
}
