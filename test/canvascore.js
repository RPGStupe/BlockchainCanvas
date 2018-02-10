var CanvasCore = artifacts.require("CanvasCore");
var MarketPlace = artifacts.require("MarketPlace");

contract("CanvasCore", function(accounts) {
    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];
    let canvasCore;
    const pastEvents = [];
    const logEvents = [];

    deploy = async function() {
        canvasCore = await CanvasCore.new();

        // const eventsWatch = canvasCore.allEvents();

        // eventsWatch.watch((err, res) => {
        //     if (err) return;
        //     pastEvents.push(res);
        //     console.log(">>", res);
        // });

        // logEvents.push(eventsWatch);
    };

    unwatch = function() {
        // logEvents.forEach(ev => ev.stopWatching());
    };

    describe("Contract creation:", async function() {
        before(deploy);
        after(unwatch);

        it("should set owner address to creator", async function() {
            const ownerAddress = await canvasCore.ownerAddress();
            assert.equal(user1, ownerAddress);
        });

        it("should pause contract on create", async function() {
            const isPaused = await canvasCore.paused();
            assert.equal(true, isPaused);
        });
    });

    describe("Unpause", async function() {
        beforeEach(deploy);
        afterEach(unwatch);
        it("should unpause", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            const isPaused = await canvasCore.paused();
            assert.equal(false, isPaused);
        });

        it("throw if not owner", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            let err;
            try {
                await canvasCore.unpause({from: user2});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if marketPlace is 0x00", async function() {
            let err;
            try {
                await canvasCore.unpause();
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if newContractAddress is set", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.setNewAddress(user2);
            let err;
            try {
                await canvasCore.unpause();
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("SetNewAddress:", async function() {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should set new address when owner and paused", async function() {
            await canvasCore.setNewAddress(user2);
            const newAddress = await canvasCore.newContractAddress();
            assert.equal(user2, newAddress);
        });

        it("fail set new address when not owner", async function() {
            let err;
            try {
                await canvasCore.setNewAddress(user2, {from: user3});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("fail set new address when not paused", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            let err;
            try {
                await canvasCore.setNewAddress(user2);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("Sending ETH:", async function() {
        beforeEach(deploy);
        afterEach(unwatch);

        it("throw when sending ether", async function() {
            let err;
            try {
                await canvasCore.sendTransaction({
                    from: user2,
                    value: 10});
            } catch (error) {
                err = error;
            }
            assert.ok(err instanceof Error);
        });
    });

    describe("GetCanvas", async function() {
        beforeEach(deploy);
        afterEach(unwatch);
        it("should return canvas data", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();

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
    });

    describe("FillCanvas", async function() {
        beforeEach(deploy);
        afterEach(unwatch);
        it("should fill canvas", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, {from: user2, value: 10000000000000000});

            await canvasCore.fillCanvas(0, 
                [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                {from: user2}
            );
        
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

        it("throw if not owner", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            let err;
            try {
                await canvasCore.fillCanvas(0, 
                    [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                    [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                    [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255],
                    [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10,255,255,255,255]
                );
            } catch (error) {
                err = error;
            }
            assert.ok(err instanceof Error);
        });
    });
});