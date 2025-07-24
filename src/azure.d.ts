interface AzurePlayer extends Player {
  // any information you add on each result['players']
}

interface AzureGamedatas extends Gamedatas<AzurePlayer> {}

interface AzureGui extends Game {}
