var CanvasCore = artifacts.require("CanvasCore");
var MarketPlace = artifacts.require("MarketPlace");

contract("CanvasOwnership", function (accounts) {
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

	describe("ImplementsERC721:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should return true", async function () {
			const implementsERC721 = await canvasCore.implementsERC721();

			assert.equal(true, implementsERC721);
		});
	});

	describe("TotalSupply:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should return released canvas count", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();

			const nCanvas = await canvasCore.totalSupply();
			assert.equal(5, nCanvas.toNumber());
		});
	});

	describe("BalanceOf:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should return balance of address", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(2, { from: user3, value: 10000000000000000 });


			const mCanvasUser3 = await canvasCore.balanceOf(user3);
			const nCanvasMarketplace = await canvasCore.balanceOf(marketPlace.address);
			assert.equal(1, mCanvasUser3.toNumber());
			assert.equal(4, nCanvasMarketplace.toNumber());
		});
	});

	describe("OwnerOf:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should return owner of canvas", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(1, { from: user3, value: 10000000000000000 });


			const ownerOf1 = await canvasCore.ownerOf(0);
			const ownerOf2 = await canvasCore.ownerOf(1);

			assert.equal(marketPlace.address, ownerOf1);
			assert.equal(user3, ownerOf2);
		});

		it("throw if no owner", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();

			let err;
			try {
				const ownerOf = await canvasCore.ownerOf(0);
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});
	});

	describe("Approve:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should approve", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			await canvasCore.approve(user1, 0, { from: user3 });

			// TODO: Listen for Approval event
		});

		it("throw if not owner", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			let err;
			try {
				await canvasCore.approve(user1, 0, { from: user1 });
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

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			await canvasCore.pause();
			let err;
			try {
				await canvasCore.approve(user1, 0, { from: user3 });
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});
	});

	describe("TransferFrom:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should transfer", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.approve(user1, 0, {from: user3});
			await canvasCore.transferFrom(user3, user1, 0, { from: user1 });

			const owner = await canvasCore.ownerOf(0);

			assert.equal(user1, owner);
		});

		it("throw if not approved", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			let err;
			try {
				await canvasCore.transferFrom(user3, user1, 0, { from: user1 });
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});

		it("throw if _from is not owner", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.approve(user1, 0, {from: user3});
			
			let err;
			try {
				await canvasCore.transferFrom(user2, user1, 0, { from: user1 });
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

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.approve(user1, 0, {from: user3});
			
			await canvasCore.pause();

			let err;
			try {
				await canvasCore.transferFrom(user3, user1, 0, { from: user1 });
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});
	});

	describe("Transfer:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should transfer", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.transfer(user1, 0, {from: user3});

			const owner = await canvasCore.ownerOf(0);

			assert.equal(user1, owner);
		});

		it("throw if not owner", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			let err;
			try {
				await canvasCore.transfer(user1, 0, { from: user1 });
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});

		it("throw if _to is 0x00", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			
			let err;
			try {
				await canvasCore.transferFrom(0, 0, { from: user3 });
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

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.approve(user1, 0, {from: user3});
			
			await canvasCore.pause();

			let err;
			try {
				await canvasCore.transfer(user1, 0, { from: user3 });
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});
	});

	describe("RescueLostCanvas:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should transfer", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.transfer(canvasCore.address, 0, {from: user3});

			await canvasCore.rescueLostCanvas(0, user3);

			const owner = await canvasCore.ownerOf(0);

			assert.equal(user3, owner);
		});

		it("throw if not send by contract owner", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });
			await canvasCore.transfer(canvasCore.address, 0, {from: user3});

			let err;
			try {
				await canvasCore.rescueLostCanvas(0, user3, {from: user3});
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});

		it("throw if contract is not owner of canvas", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();

			await marketPlace.bidOnAuction(0, { from: user3, value: 10000000000000000 });

			let err;
			try {
				await canvasCore.rescueLostCanvas(0, user2);
			} catch (error) {
				err = error;
			};
			assert.ok(err instanceof Error);
		});
	});

	describe("TokensOfOwner:", async function () {
		beforeEach(deploy);
		afterEach(unwatch);

		it("should return canvasIds", async function () {
			const marketPlace = await MarketPlace.new(canvasCore.address, 0);
			await canvasCore.setMarketPlaceAddress(marketPlace.address);
			await canvasCore.unpause();
			await canvasCore.releaseCycleCanvas();
			await canvasCore.releaseCycleCanvas();

			const canvasIds = await canvasCore.tokensOfOwner(marketPlace.address);

			assert.equal(2, canvasIds.length);
			assert.equal(0, canvasIds[0].toNumber());
			assert.equal(1, canvasIds[1].toNumber());
		});
	});
});