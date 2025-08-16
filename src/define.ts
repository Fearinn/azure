define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  getLibUrl("bga-autofit", "1.x"),
], function (dojo, declare, counter, gamegui, BgaAutoFit) {
  (window as any).BgaAutoFit = BgaAutoFit;

  return declare("bgagame.azure", ebg.core.gamegui, new Azure());
});
