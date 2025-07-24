define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
], function (dojo, declare, counter, gamegui, dice, BgaAutoFit) {
  (window as any).BgaAutoFit = BgaAutoFit;

  return declare(
    "bgagame.azure",
    ebg.core.gamegui,
    new Azure()
  );
});
