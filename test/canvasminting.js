var CanvasCore = artifacts.require("CanvasCore");
var MarketPlace = artifacts.require("MarketPlace");

contract("CanvasMinting", function(accounts) {
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

    describe("ReleaseCycleCanvas:", async function() {
        beforeEach(deploy);
        afterEach(unwatch);

        it("should release canvas", async function() {
            const marketPlace = await MarketPlace.new(canvasCore.address, 0);
            await canvasCore.setMarketPlaceAddress(marketPlace.address);
            await canvasCore.unpause();
            await canvasCore.releaseCycleCanvas();

            const nCanvas = await canvasCore.releaseCanvasCount();

            assert.equal(1, nCanvas);
        });
    });
});