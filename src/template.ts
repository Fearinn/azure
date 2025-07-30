class AzureTemplate {
  private game: Azure;
  private gamedatas: AzureGamedatas;

  constructor(game: Azure, gamedatas: AzureGamedatas) {
    this.game = game;
    this.gamedatas = gamedatas;
  }

  setupZoom() {
    new ZoomManager({
      element: document.getElementById(`azr_gameArea`),
      localStorageZoomKey: "azr-zoom",
      zoomLevels: [
        0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1, 1.125, 1.25, 1.375, 1.5,
      ],
      zoomControls: {
        color: "white",
      },
    });
  }

  setupRealm() {
    const { realm, domainsOrder, domainsRotations, domainsSides, decksCounts } =
      this.gamedatas;

    const domainsElement = document.getElementById(`azr_domains`);

    domainsOrder.forEach((domain_id) => {
      const rotation = domainsRotations[domain_id] * 90;
      const side = domainsSides[domain_id];

      domainsElement.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_domain-${domain_id}" class="azr_domain" 
        style="background-image: url(${g_gamethemeurl}img/domain_${domain_id}${side}.jpg); --rotation: ${rotation}deg; --side: ${side}; --domain: ${domain_id}"></div>
      `
      );
    });

    const spacesElement = document.getElementById(`azr_spaces`);

    for (const x in realm) {
      for (const y in realm[x]) {
        const space_id = realm[x][y];

        spacesElement.insertAdjacentHTML(
          `beforeend`,
          `<div id="azr_space-${space_id}" class="azr_space" style="--x: ${x}; --y: ${y}"></div>`
        );
      }
    }

    const decksElement = document.getElementById(`azr_decks`);
    for (const domain_id in decksCounts) {
      decksElement.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_deck-${domain_id}" class="azr_deck"></div>`
      );
    }
  }

  setupWisdomTrack() {
    const wisdomTrack = document.getElementById(`azr_wisdomTrack`);

    for (let i = 1; i <= 25; i++) {
      wisdomTrack.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_wisdomTrack-${i}" class="azr_wisdomTrack-number"></div>`
      );
    }
  }

  setupStocks() {
    const beastManager = new BeastManager(this.game);
    beastManager.setup();

    const spacetManager = new SpaceManager(this.game);
    spacetManager.setup();

    const qiManager = new QiManager(this.game);
    qiManager.setup();
  }

  setupPanels() {
    const { handsCounts, stoneCounts } = this.gamedatas;

    for (const p_id in this.gamedatas.players) {
      const player_id = Number(p_id);
      const { color: player_color } = this.gamedatas.players[player_id];

      const playerPanel = this.game.getPlayerPanelElement(player_id);
      playerPanel.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_stoneCounter-${player_id}" class="azr_counter azr_stoneCounter">
          <div id="azr_stoneIcon-${player_id}" class=" azr_counter-icon azr_stone azr_stone-${player_color} azr_stoneCounter-icon" 
          style="--color: #${player_color};"></div>
          <span id="azr_stoneCount-${player_id}" class="azr_counter-count">0</span>
        </div>
        <div id="azr_handCounter-${player_id}" class="azr_counter azr_handCounter">
          <div id="azr_handIcon-${player_id}" class="azr_qi azr_counter-icon azr_handCounter-icon"></div>
          <span id="azr_handCount-${player_id}" class="azr_counter-count">0</span>
        </div>`
      );

      this.gamedatas.counters = {
        ...this.gamedatas.counters,
        [player_id]: {
          hand: new ebg.counter(),
          stones: new ebg.counter(),
        },
      };

      const { hand, stones } = this.gamedatas.counters[player_id];
      hand.create(`azr_handCount-${player_id}`);
      hand.setValue(handsCounts[player_id]);

      stones.create(`azr_stoneCount-${player_id}`);
      stones.setValue(stoneCounts[player_id]);
    }
  }

  setup() {
    this.setupZoom();
    this.setupRealm();
    this.setupWisdomTrack();
    this.setupStocks();
    this.setupPanels();
  }
}
