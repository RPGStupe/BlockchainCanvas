var CanvasCore = artifacts.require("CanvasCore");

contract("CanvasCore", function(accounts) {
  const user1 = accounts[0];
  const user2 = accounts[1];
  const user3 = accounts[2];
  let canvasCore;

  deploy = async function() {
    console.log("deploying contract");
    canvasCore = await CanvasCore.new();
  };

  describe("Canvas release:", function() {
    beforeEach(deploy);
    it("release cycle", async function() {
      
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();

      const canvas0 = await canvasCore.getCanvas(0);
      const canvas1 = await canvasCore.getCanvas(1);
      const canvas2 = await canvasCore.getCanvas(2);
      const canvas3 = await canvasCore.getCanvas(3);
      const canvas4 = await canvasCore.getCanvas(4);

      const nCanvas = await canvasCore.totalSupply();
      const nCanvasStandard = await canvasCore.releaseCanvasCount();

      assert.equal(9, nCanvas.toNumber());
      assert.equal(9, nCanvasStandard.toNumber());

      assert.equal(0, canvas0[0].toNumber(), "Canvas 0 x");
      assert.equal(0, canvas0[1].toNumber(), "Canvas 0 y");
      assert.equal(1, canvas1[0].toNumber(), "Canvas 1 x");
      assert.equal(0, canvas1[1].toNumber(), "Canvas 1 y");
      assert.equal(2, canvas2[0].toNumber(), "Canvas 2 x");
      assert.equal(0, canvas2[1].toNumber(), "Canvas 2 y");
      assert.equal(3, canvas3[0].toNumber(), "Canvas 3 x");
      assert.equal(0, canvas3[1].toNumber(), "Canvas 3 y");
      assert.equal(4, canvas4[0].toNumber(), "Canvas 4 x");
      assert.equal(0, canvas4[1].toNumber(), "Canvas 4 y");
    });
  });
  
  describe("Canvas modification:", function() {
    beforeEach(deploy);
    it("get canvas data", async function() {
      await canvasCore.releaseCycleCanvas();
      const canvas = await canvasCore.getCanvas(0);

      const x = canvas[0];
      const y = canvas[1];
      const red = canvas[2];
      const green = canvas[3];
      const blue = canvas[4];
      const alpha = canvas[5];

      assert.equal(0, x.toNumber());
      assert.equal(0, y.toNumber());

      assert.equal(64, red.length);
      red.forEach(pixel => {
        assert.equal(0, pixel.toNumber());
      });

      assert.equal(64, green.length);
      green.forEach(pixel => {
        assert.equal(0, pixel.toNumber());
      });

      assert.equal(64, blue.length);
      blue.forEach(pixel => {
        assert.equal(0, pixel.toNumber());
      });

      assert.equal(64, alpha.length);
      alpha.forEach(pixel => {
        assert.equal(0, pixel.toNumber());
      });
    });

    it("fill canvas", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.fillCanvas(0, 
        [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
        [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
        [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
        [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255]);

      const canvas = await canvasCore.getCanvas(0);
      
      const red = canvas[2];
      const green = canvas[3];
      const blue = canvas[4];
      const alpha = canvas[5];

      // check some pixels in each the array
      assert.equal(1, red[0].toNumber());
      assert.equal(2, red[1].toNumber());
      assert.equal(3, red[2].toNumber());
      assert.equal(10, red[9].toNumber());
      assert.equal(255, green[63].toNumber());
      assert.equal(6, green[35].toNumber());
      assert.equal(255, blue[60].toNumber());
      assert.equal(10, blue[59].toNumber());
      assert.equal(3, alpha[12].toNumber());
      assert.equal(8, alpha[7].toNumber());
      assert.equal(255, alpha[62].toNumber());
    });
  });

  describe("ERC721 functions:", function() {
    beforeEach(deploy);
    it("check total supply", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();

      const nCanvas = await canvasCore.totalSupply();

      assert.equal(6, nCanvas.toNumber());
    });

    it("check total supply", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();

      const nBalance = await canvasCore.balanceOf(user1);

      assert.equal(6, nBalance.toNumber());
    });

    it("check owner", async function() {
      await canvasCore.releaseCycleCanvas();

      const owner = await canvasCore.ownerOf(0);

      assert.equal(user1, owner);
    });

    
    it("check transferFrom", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.transferFrom(user1, user2, 0);

      const owner = await canvasCore.ownerOf(0);

      assert.equal(user2, owner);
    });

    
    it("check transfer", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.transfer(user2, 0);

      const owner = await canvasCore.ownerOf(0);

      assert.equal(user2, owner);
    });

    it("check tokens of owner", async function() {
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();
      await canvasCore.releaseCycleCanvas();

      await canvasCore.transfer(user2, 1);

      const tokensOfUser1 = await canvasCore.tokensOfOwner(user1);

      assert.equal(2, tokensOfUser1.length);
      assert.equal(0, tokensOfUser1[0].toNumber());
      assert.equal(2, tokensOfUser1[1].toNumber());
    });

  });


});