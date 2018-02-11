var MarketPlace = artifacts.require("MarketPlace");
var CanvasCore = artifacts.require("CanvasCore");

contract("MarketPlace", function (accounts) {
    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];
    let marketplace;
    let canvasCore;
    const pastEvents = [];
    const logEvents = [];

    deploy = async function () {
        canvasCore = await CanvasCore.new();
        marketplace = await MarketPlace.new(canvasCore.address, 10);
        await canvasCore.setMarketPlaceAddress(marketplace.address);
        await canvasCore.unpause();

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

    describe("Contract creation:", function () {
        beforeEach(deploy);
        afterEach(unwatch);
        
        it("should set owner cut", async function () {
            assert.equal(10, await marketplace.ownerCut());
        });
        
        it("should set nft contract", async function () {
            assert.equal(canvasCore.address, await marketplace.nftContract());
        });
        
        it("throw if cut > 10000", async function () {
            let err;
            try {
                await MarketPlace.new(canvasCore.address, 10001);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
        
        it("throw if nftcontract is not ERC721", async function () {
            let err;
            try {
                await MarketPlace.new(user1, 100);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("withdrawBalance:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("throw if not nft contract", async function () {
            let err;
            try {
                await marketplace.withdrawBalance();
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CreateAuction:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("throw if not nft contract", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            let err;
            try {
                await marketplace.createAuction(0, 1, 0, 100, user1);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("BidOnAuction:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should transfer to winner", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            const owner = await canvasCore.ownerOf(0);

            assert.equal(user1, owner);
        });
        
        it("throw if paused", async function () {
            await canvasCore.releaseCycleCanvas();
            await canvasCore.pause();
            let err;
            try {
                await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if not sufficient value", async function () {
            await canvasCore.releaseCycleCanvas();
            let err;
            try {
                await marketplace.bidOnAuction(0, { value: 10 });
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CancelAuction:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should cancel auction", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createAuction(0, 1, 0, 100);
            await marketplace.cancelAuction(0);

            let err;
            try {
                await marketplace.getAuction(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
        
        it("throw if not seller", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createAuction(0, 1, 0, 100);

            let err;
            try {
                await canvasCore.cancelAuction(0, {from: user2});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if not on auction", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });

            let err;
            try {
                await marketplace.cancelAuction(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CreateOffer:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("throw if not nft contract", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            let err;
            try {
                await marketplace.createOffer(0, 1, user1);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("Buy:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should transfer to buyer", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 10);
            await marketplace.buy(0, {from: user3, value: 10});
            const owner = await canvasCore.ownerOf(0);

            assert.equal(user3, owner);
        });
        
        it("throw if paused", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 10);
            await canvasCore.pause();
            let err;
            try {
                await marketplace.buy(0, {from: user2, value: 10});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if not sufficient value", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 10);
            let err;
            try {
                await marketplace.buy(0, {from: user2, value: 1});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("CancelOffer:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should cancel offer", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 1);
            await marketplace.cancelOffer(0);

            let err;
            try {
                await marketplace.getOffer(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
        
        it("throw if not seller", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 1);

            let err;
            try {
                await canvasCore.cancelOffer(0, {from: user2});
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });

        it("throw if not on auction", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });

            let err;
            try {
                await canvasCore.cancelOffer(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("GetAuction:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should return auction", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createAuction(0, 10, 9, 100);
            
            const auction = await marketplace.getAuction(0);

            assert.equal(user1, auction[0]);
            assert.equal(10, auction[1].toNumber());
            assert.equal(9, auction[2].toNumber());
            assert.equal(100, auction[3].toNumber());
        });
        
        it("throw if not on auction", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });

            let err;
            try {
                const auction = await marketplace.getAuction(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });

    describe("GetOffer:", function () {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should return offer", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });
            await canvasCore.createOffer(0, 10);
            
            const offer = await marketplace.getOffer(0);

            assert.equal(user1, offer[0]);
            assert.equal(10, offer[1].toNumber());
        });
        
        it("throw if not on offer", async function () {
            await canvasCore.releaseCycleCanvas();
            await marketplace.bidOnAuction(0, { value: 10000000000000000 });

            let err;
            try {
                const auction = await marketplace.getOffer(0);
            } catch (error) {
                err = error;
            };
            assert.ok(err instanceof Error);
        });
    });
});