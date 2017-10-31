const assert = require("chai").assert;
const bvd = require("virtual-alexa");

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
                return alexa.filter(function (request) {
                    console.log("Request: " + JSON.stringify(request, null, 2));
                }).utter("two");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "contestant one");
                return alexa.utter("john");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "Contestant 2");
                return alexa.utter("juan");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "let's start the game");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                done();
            });
        });

        it("Accepts responses without dollars", function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            return alexa.launch().then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");
                return alexa.utter("2");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "contestant one");
                return alexa.utter("john");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "Contestant 2");
                return alexa.utter("juan");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "let's start the game");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
            });
        });
    });

    describe("One player", () => {
        it("Flow works", function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            return alexa.launch().then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");
                return alexa.utter("1");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "tell us your name");
                return alexa.utter("juan");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Game ended, your final score was");
            });
        });
    });

    describe("Multiplayer", () => {
        it("Run multiplayer till the end", function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            return alexa.launch().then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");
                return alexa.utter("2");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "contestant one");
                return alexa.utter("john");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "what is your name");
                assert.include(reply.response.outputSpeech.ssml, "Contestant 2");
                return alexa.utter("pedro");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "let's start the game");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "the actual price was");
                assert.include(reply.response.outputSpeech.ssml, "Guess the price");
                return alexa.utter("200 dollars");
            }).then(function (reply) {
                assert.include(reply.response.outputSpeech.ssml, "Game ended, the winner is");
            });
        });
    })
});

