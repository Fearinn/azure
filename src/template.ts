class AzureTemplate {
  private game: Azure;
  private gamedatas: AzureGamedatas;

  constructor(game: Azure, gamedatas: AzureGamedatas) {
    this.game = game;
    this.gamedatas = gamedatas;
  }

  private setupZoom(): void {
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

  private setupRealm(): void {
    const { domainsOrder, domainsRotations, domainsSides, decksCounts } =
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

    const decksElement = document.getElementById(`azr_decks`);
    for (const domain_id in decksCounts) {
      decksElement.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_deck-${domain_id}" class="azr_deck"></div>`
      );
    }
  }

  private setupHand(): void {
    const handTitle = document.getElementById(`azr_handTitle`);
    handTitle.textContent = _("Your hand");
  }

  private setupWisdomTrack() {
    const wisdomTrack = document.getElementById(`azr_wisdomTrack`);

    for (let i = 1; i <= 25; i++) {
      wisdomTrack.insertAdjacentHTML(
        `beforeend`,
        `<div id="azr_wisdomTrack-${i}" class="azr_wisdomTrack-number"></div>`
      );
    }
  }

  private setupFavors(): void {
    const favorsElement = document.getElementById(`azr_favorsContainer`);
    const titleElement = document.getElementById(`azr_favorsTitle`);
    titleElement.textContent = _("active favors");

    const utils = new Utils(this.game);

    for (const p_id in this.gamedatas.players) {
      const player_id = Number(p_id);
      const { color, name } = this.gamedatas.players[player_id];

      const title =
        player_id === this.game.player_id
          ? this.game.format_string("You (${player_name})", {
              player_name: name,
            })
          : name;

      const opp_color = utils.getOppColor(color);
      const order = player_id === this.game.player_id ? 0 : 1;

      if (player_id === this.game.player_id) {
        titleElement.style.setProperty("--color", `#${color}`);
        titleElement.style.setProperty("--opp-color", `#${opp_color}`);
      }

      favorsElement.insertAdjacentHTML(
        "beforeend",
        `<div id="azr_favors-${player_id}" class="azr_favors" 
        style="--color: #${color}; --opp-color: #${opp_color}; --bg-color: #${color}aa; order: ${order}">
        <div id="azr_favorBeasts-${player_id}" class="azr_favorBeasts"></div>
        <h4 class="playername">
        ${title}
        </h4>
        </div>`
      );
    }
  }

  private setupStocks(): void {
    const spaceManager = new SpaceManager(this.game);
    spaceManager.setup();

    const beastManager = new BeastManager(this.game);
    beastManager.setup();

    const stoneManager = new StoneManager(this.game);
    stoneManager.setup();

    const qiManager = new QiManager(this.game);
    qiManager.setup();

    const wisdomManager = new WisdomManager(this.game);
    wisdomManager.setup();
  }

  private setupPanels(): void {
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

      const playerNameElement = document
        .getElementById(`player_name_${player_id}`)
        .querySelector("a") as HTMLElement;
      new Utils(this.game).stylePlayerName(playerNameElement);
    }
  }

  private initObserver(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        const { addedNodes } = mutation;

        addedNodes.forEach((target: HTMLElement) => {
          if (target.nodeType !== 1) {
            return;
          }

          const utils = new Utils(this.game);

          if (target.classList.contains("playername")) {
            utils.stylePlayerName(target);
            return;
          }

          target
            .querySelectorAll(".playername")
            .forEach((child: HTMLElement) => {
              utils.stylePlayerName(child);
            });
        });
      });
    });

    const observable = ["logs", "maintitlebar_content", "chatbardock"];

    observable.forEach((observable) => {
      const observableElement = document.getElementById(observable);

      observer.observe(observableElement, {
        childList: true,
        subtree: true,
      });
    });
  }

  public setup() {
    const { color } = this.gamedatas.players[this.game.player_id];
    const opp_color = new Utils(this.game).getOppColor(color);

    const html = document.querySelector("html");
    html.style.setProperty("--color", `#${color}`);
    html.style.setProperty("--opp-color", `#${opp_color}`);

    this.setupZoom();
    this.setupRealm();
    this.setupHand();
    this.setupWisdomTrack();
    this.setupFavors();
    this.setupPanels();
    this.setupStocks();
    this.initObserver();
  }
}
