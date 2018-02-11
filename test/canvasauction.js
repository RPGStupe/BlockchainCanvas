var CanvasCore = artifacts.require("CanvasCore");
var MarketPlace = artifacts.require("MarketPlace");

contract("CanvasAuction", function (accounts) {
    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];
    let canvasCore;
    const pastEvents = [];
    const logEvents = [];

    deploy = async function () {
        canvasCore = await CanvasCore.new();

        // const eventsWatch = canvasCore.allEvents();

        // eventsWatch.watch((err, res) => {
        //     if (err) return;
        //     pastEvents.push(res);
        //     console.log(">>", res);
        // });

        // logEvents.push(eventsWatch);
    };

    unwatch = function () {
        // logEvents.forEach(ev => ev.stopWatching());
    };

    describe("SetMarketPlaceAddress:", async function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should set marketplace address", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);

            const address = await canvasCore.marketPlace();

            assert.equal(marketPlace.address, address);
        });

        it("throw if not owner", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);

            let err;
            try {
                await canvasCore.setMarketPlaceAddress(marketPlace.address,
                    { from: user2 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if not marketplace", async function () {
            let err;
            try {
                await canvasCore.setMarketPlaceAddress(user3);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CreateOffer:", async function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should create offer", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            await canvasCore.createOffer(0, 1000, { from: user3 });

            const offer = await marketPlace.getOffer(0);

            assert.equal(user3, offer[0]);
            assert.equal(1000, offer[1].toNumber());
        });

        it("throw if not owner", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            let err;
            try {
                await canvasCore.createOffer(0, 1000, { from: user2 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if paused", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            await canvasCore.pause();

            let err;
            try {
                await canvasCore.createOffer(0, 1000, { from: user3 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CreateAuction:", async function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should create auction", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            await canvasCore.createAuction(0, 1000, 999, 10000, { from: user3 });

            const auction = await marketPlace.getAuction(0);

            assert.equal(user3, auction[0]);
            assert.equal(1000, auction[1].toNumber());
            assert.equal(999, auction[2].toNumber());
            assert.equal(10000, auction[3].toNumber());
        });

        it("throw if not owner", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            let err;
            try {
                await canvasCore.createAuction(0, 1000, 999, 10000, { from: user2 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if paused", async function () {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            // Need to buy the canvas before being able to fill it
            await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

            await canvasCore.pause();

            let err;
            try {
                await canvasCore.createAuction(0, 1000, 999, 10000, { from: user3 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });
});