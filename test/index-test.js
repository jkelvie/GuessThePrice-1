require("babel-polyfill");
const assert = require("chai").assert;
const bvd = require("virtual-alexa");

describe("DefaultSkill Test", function() {
    this.timeout(10000);

    describe("Onboarding Tests", function () {
        it("Launches successfully", async function() {
            const bvd = require("virtual-alexa");
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            let reply = await alexa.launch();
            assert.include(reply.response.outputSpeech.ssml, "Welcome to guess the price");

            reply = await alexa.utter("two");
            assert.include(reply.response.outputSpeech.ssml, "what is your name");
            assert.include(reply.response.outputSpeech.ssml, "contestant one");

            reply = await alexa.utter("john");
            assert.include(reply.response.outputSpeech.ssml, "what is your name");
            assert.include(reply.response.outputSpeech.ssml, "Contestant 2");

            reply = await alexa.utter("juan");
            assert.include(reply.response.outputSpeech.ssml, "let's start the game");
            assert.include(reply.response.outputSpeech.ssml, "Guess the price");

            reply = await alexa.filter(function (request) {
                console.log("Request: " + JSON.stringify(request, null, 2));
            }).utter("200 dollars");
            assert.include(reply.response.outputSpeech.ssml, "the actual price was");
        });

        it("Accepts responses without dollars", async function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            const launchResponse = await alexa.launch();
            assert.include(launchResponse.response.outputSpeech.ssml, "Welcome to guess the price");

            const playerOneResponse = await alexa.utter("2");
            assert.include(playerOneResponse.response.outputSpeech.ssml, "what is your name");
            assert.include(playerOneResponse.response.outputSpeech.ssml, "contestant one");

            const playerTwoResponse = await alexa.utter("john");
            assert.include(playerTwoResponse.response.outputSpeech.ssml, "what is your name");
            assert.include(playerTwoResponse.response.outputSpeech.ssml, "Contestant 2");

            const gameStartResponse =  await alexa.utter("juan");
            assert.include(gameStartResponse.response.outputSpeech.ssml, "let's start the game");
            assert.include(gameStartResponse.response.outputSpeech.ssml, "Guess the price");

            const priceGuessResponse = await alexa.utter("200");
            assert.include(priceGuessResponse.response.outputSpeech.ssml, "the actual price was");
        });
    });

    describe("One player", () => {
        it("Flow works", async function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            const launchResponse = await alexa.launch();
            assert.include(launchResponse.response.outputSpeech.ssml, "Welcome to guess the price");

            const singlePlayerResponse = await alexa.utter("1");
            assert.include(singlePlayerResponse.response.outputSpeech.ssml, "tell us your name");

            const firstProductQuestion = await alexa.utter("juan");
            assert.include(firstProductQuestion.response.outputSpeech.ssml, "Guess the price");

            const secondProductQuestion = await alexa.utter("200 dollars");
            assert.include(secondProductQuestion.response.outputSpeech.ssml, "the actual price was");
            assert.include(secondProductQuestion.response.outputSpeech.ssml, "Guess the price");

            const thirdProductQuestion = await alexa.utter("200 dollars");
            assert.include(thirdProductQuestion.response.outputSpeech.ssml, "the actual price was");
            assert.include(thirdProductQuestion.response.outputSpeech.ssml, "Guess the price");

            const gameEndQuestion = await alexa.utter("200 dollars");
            assert.include(gameEndQuestion.response.outputSpeech.ssml, "Game ended, your final score was");
        });
    });

    describe("Multiplayer", () => {
        it("Run multiplayer till the end", async function () {
            const alexa = bvd.VirtualAlexa.Builder()
                .handler("index.handler") // Lambda function file and name
                .intentSchemaFile("./speechAssets/IntentSchema.json")
                .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
                .create();

            const launchRequest = await alexa.launch();
            assert.include(launchRequest.response.outputSpeech.ssml, "Welcome to guess the price");

            const firstPlayerResponse = await alexa.utter("2");
            assert.include(firstPlayerResponse.response.outputSpeech.ssml, "what is your name");
            assert.include(firstPlayerResponse.response.outputSpeech.ssml, "contestant one");

            const secondPlayerResponse = await alexa.utter("john");
            assert.include(secondPlayerResponse.response.outputSpeech.ssml, "what is your name");
            assert.include(secondPlayerResponse.response.outputSpeech.ssml, "Contestant 2");

            const gameStartResponse = await alexa.utter("pedro");
            assert.include(gameStartResponse.response.outputSpeech.ssml, "let's start the game");
            assert.include(gameStartResponse.response.outputSpeech.ssml, "Guess the price");

            const secondPlayerFirstProduct = await alexa.utter("200 dollars");
            assert.include(secondPlayerFirstProduct.response.outputSpeech.ssml, "the actual price was");
            assert.include(secondPlayerFirstProduct.response.outputSpeech.ssml, "Guess the price");

            const firstPlayerSecondResponse = await alexa.utter("200 dollars");
            assert.include(firstPlayerSecondResponse.response.outputSpeech.ssml, "the actual price was");
            assert.include(firstPlayerSecondResponse.response.outputSpeech.ssml, "Guess the price");

            const secondPlayerSecondResponse = await alexa.utter("200 dollars");
            assert.include(secondPlayerSecondResponse.response.outputSpeech.ssml, "the actual price was");
            assert.include(secondPlayerSecondResponse.response.outputSpeech.ssml, "Guess the price");

            const firstPlayerThirdResponse = await alexa.utter("200 dollars");
            assert.include(firstPlayerThirdResponse.response.outputSpeech.ssml, "the actual price was");
            assert.include(firstPlayerThirdResponse.response.outputSpeech.ssml, "Guess the price");

            const secondPlayerThirdResponse = await alexa.utter("200 dollars");
            assert.include(secondPlayerThirdResponse.response.outputSpeech.ssml, "the actual price was");
            assert.include(secondPlayerThirdResponse.response.outputSpeech.ssml, "Guess the price");

            const endOfGameResponse = await alexa.utter("200 dollars");
            assert.include(endOfGameResponse.response.outputSpeech.ssml, "Game ended, the winner is");
        });
    })
});

