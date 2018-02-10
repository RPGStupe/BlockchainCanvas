const MarketPlace = artifacts.require("MarketPlace");
const CanvasOwnership = artifacts.require("CanvasOwnership");
const util = require("./util.js");

contract("MarketPlace", function(accounts) {
    const user1 = accounts[0];
    const user2 = accounts[1];
    const user3 = accounts[2];

    let marketPlace;

    let ownership;

    const deploy = async function(cut = 100) {
        console.log("deploying contract");
        
        ownership = await CanvasOwnership.new();
        marketPlace = await MarketPlace.new(ownership.address, cut);
    }

    describe("Offer testing:", function() {
        beforeEach(deploy);
        it("create offer", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createOffer(0, 100, user1);

            const offer = await marketPlace.getOffer(0);

            assert.equal(user1, offer[0]);
            assert.equal(100, offer[1].toNumber());
        });

        it("cancel offer", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createOffer(0, 100, user1);
            await marketPlace.cancelOffer(0);

            let err = null;
            try {
                await marketPlace.getOffer(0);
            } catch (error) {
                err = error
            }
            assert.ok(err instanceof Error)
        });

        it("buy offer", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createOffer(0, 1200, user1);

            await marketPlace.buy(0, {from: user2, value: 1200});

            const owner = await ownership.ownerOf(0);

            assert.equal(user2, owner);
            assert.equal(12, web3.eth.getBalance(marketPlace.address).toNumber());
        });
    });

    describe("Auction testing:", function() {
        beforeEach(deploy);
        it("create auction", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createAuction(0, 100, 10, 60, user1);

            const auction = await marketPlace.getAuction(0);

            assert.equal(user1, auction[0]);
            assert.equal(100, auction[1].toNumber());
            assert.equal(10, auction[2].toNumber());
            assert.equal(60, auction[3].toNumber());
        });

        it("cancel auction", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createAuction(0, 100, 10, 60, user1);
            await marketPlace.cancelAuction(0);

            let err = null;
            try {
                await marketPlace.getAuction(0);
            } catch (error) {
                err = error
            }
            assert.ok(err instanceof Error)
        });

        it("bid on start auction", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createAuction(0, 1200, 1000, 600, user1);



            await marketPlace.bidOnAuction(0, {from: user2, value: 1200});

            const owner = await ownership.ownerOf(0);

            assert.equal(user2, owner);
            assert.equal(12, web3.eth.getBalance(marketPlace.address).toNumber());
        });

        it("bid on mid-time auction", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createAuction(0, 1000, 100, 60, user1);
    
            util.forwardEVMTime(30);

            await marketPlace.bidOnAuction(0, {from: user2, value: 1200});

            const owner = await ownership.ownerOf(0);

            assert.equal(user2, owner);
            assert.equal(5, web3.eth.getBalance(marketPlace.address).toNumber());
        });

        it("bid on end auction", async function() {
            await ownership.releaseStandardCanvas();

            await marketPlace.createAuction(0, 1000, 100, 60, user1);
    
            util.forwardEVMTime(300);

            await marketPlace.bidOnAuction(0, {from: user2, value: 100});

            const owner = await ownership.ownerOf(0);

            assert.equal(user2, owner);
            assert.equal(1, web3.eth.getBalance(marketPlace.address).toNumber());
        });
    });
});