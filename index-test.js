const assert = require("chai").assert;

describe("DefaultSkill Test", function() {
    this.timeout(10000);

    describe("Onboarding Tests", () => {
        it("Launches successfully", function (done) {
            const bvd = require("virtual-alexa");
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            let response = alexa.launch().then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");
                return alexa.utter("2");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "contestant one");
                return alexa.utter("john");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "Contestant 2");
                return alexa.utter("john");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "let's start the game");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                done();
            });
        });
    });
});

