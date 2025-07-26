class AzureTemplate {
  private gamedatas: AzureGamedatas;

  constructor(gamedatas: AzureGamedatas) {
    this.gamedatas = gamedatas;
  }

  setup() {
    const { realm, domainsOrder, domainsRotations, domainsSides } =
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

        const spaceElement = document.getElementById(`azr_space-${space_id}`);
      }
    }
  }
}
