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
            const red1 = canvas[2];
            const green1 = canvas[3];
            const blue1 = canvas[4];
            const red2 = canvas[5];
            const green2 = canvas[6];
            const blue2 = canvas[7];

            assert.equal(0, x.toNumber());
            assert.equal(0, y.toNumber());
            assert.equal(0, red1.toNumber());
            assert.equal(0, green1.toNumber());
            assert.equal(0, blue1.toNumber());
            assert.equal(0, red2.toNumber());
            assert.equal(0, green2.toNumber());
            assert.equal(0, blue2.toNumber());
        });
    });

    describe("FillCanvas", async function() {
        beforeEach(deploy);
        afterEach(unwatch);

        // Compute the biggest number possible in 256 bit (2**256 - 1)
        // need bignumber because javascript does not work with numbers that large
        const uint256Max = web3.toBigNumber(2).pow(256).minus(1);

        it("should fill canvas", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, {from: user2, value: 10000000000000000});


            await canvasCore.fillCanvas(0, uint256Max, 1, 2, 3, 4, 5,
                {from: user2}
            );
        
            const canvas = await canvasCore.getCanvas(0);
            
            const red1 = canvas[2];
            const green1 = canvas[3];
            const blue1 = canvas[4];
            const red2 = canvas[5];
            const green2 = canvas[6];
            const blue2 = canvas[7];
    
            // check some pixels in each the array
            assert.equal(uint256Max, red1.toNumber());
            assert.equal(1, green1.toNumber());
            assert.equal(2, blue1.toNumber());
            assert.equal(3, red2.toNumber());
            assert.equal(4, green2.toNumber());
            assert.equal(5, blue2.toNumber());
        });

        it("throw if not owner", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            let err;
            try {
                await canvasCore.fillCanvas(0, 0, 1, 2, 3, 4, 5);
            } catch (error) {
                err = error;
            }
            assert.ok(err instanceof Error);
        });
    });
});