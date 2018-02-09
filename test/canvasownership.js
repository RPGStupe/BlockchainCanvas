// Specifically request an abstraction for MetaCoin
var CanvasOwnership = artifacts.require("CanvasOwnership");

contract("CanvasOwnership", function(accounts) {
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  let canvasOwnership;

  beforeEach(function() {
    console.log("deploying contract");
    return CanvasOwnership.new()
    .then(function(instance) {
      canvasOwnership = instance;
    });
  });

  describe("Canvas release:", function() {
    it("release a standard canvas", async function() {
      
      await canvasOwnership.releaseStandardCanvas();

      const nCanvas = await canvasOwnership.totalSupply();
      const nCanvasStandard = await canvasOwnership.standardReleaseCount();

      assert.equal(nCanvas.toNumber(), 1);
      assert.equal(nCanvasStandard.toNumber(), 1);
    });

    it("release a promo canvas", async function() {
      
      await canvasOwnership.releasePromoCanvas();

      const nCanvas = await canvasOwnership.totalSupply();
      const nCanvasPromo = await canvasOwnership.promoReleaseCount();

      assert.equal(nCanvas.toNumber(), 1);
      assert.equal(nCanvasPromo.toNumber(), 1);
    });
  });

  describe("Canvas modification:", function() {
    it("get canvas data", async function() {
      await canvasOwnership.releaseStandardCanvas();
      
    });

  });
});