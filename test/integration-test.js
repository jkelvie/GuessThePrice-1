require("babel-polyfill");
require("dotenv").config();
const assert = require("chai").assert;
const vds = require("virtual-device-sdk");

describe("GuessThePrice Integration Test", function() {
    this.timeout(120 * 1000);

    describe("Onboarding Test", function () {
        it("Runs through game with two players", async () => {
            const virtualDevice = new vds.VirtualDevice(process.env.VIRTUAL_DEVICE_TOKEN);
            await virtualDevice.message("alexa exit");
            let result = await virtualDevice.message("open guess the price");

            assert.include(result.transcript, "welcome to guess the price how many persons are playing today");

            result = await virtualDevice.message("two");
            console.log("Result: " + result.transcript);
            assert.include(result.transcript, "what is your name");

            result = await virtualDevice.message("john");
            console.log("Result: " + result.transcript);
            assert.include(result.transcript, "tell us what is your name");

            result = await virtualDevice.message("frank");
            console.log("Result: " + result.transcript);
            assert.include(result.transcript, "start the game");
            assert.include(result.transcript, "your product is");

            result = await virtualDevice.message("200 dollars");
            console.log("Result: " + result.transcript);
            assert.include(result.transcript.toLowerCase(), "the actual price was");
        });
    });
});