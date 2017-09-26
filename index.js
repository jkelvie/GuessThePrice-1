const Alexa = require('alexa-sdk');
const languageStrings = require('./languageStrings.js');
const product = require("./lib/products");
const game = require("./lib/game");

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(newSessionHandlers, startModeHandlers, setupUsersHandlers, gameRoundHandlers, handlers);
    alexa.execute();
};

const states = {
    START_MODE: '_START_MODE', // Prompt the user to start or restart the game.
    SETUP_USERS: '_SETUP_USERS', // User is trying to guess the number.
    GAME_ROUND: '_GAME_ROUND',
    TELL_SCORE: '_TELL_SCORE',

};

const newSessionHandlers = {
    'LaunchRequest': function () {
        const welcome = this.t("WELCOME_TO_GUESS_THE_PRICE");
        this.handler.state = states.START_MODE;
        this.emit(':ask', welcome, this.t("WELCOME_REPROMPT"));
    },
};

const getGuessThePricePhrase = (alexaContext) => {
    const randIndex = Math.floor(Math.random() * 3) + 1;
    const guessThePriceTag = "GUESS_THE_PRICE_" + randIndex;
    return alexaContext.t(guessThePriceTag);
};

const askPlayerName = (alexaContext, playerQuantity) => {
    alexaContext.attributes["currentPlayerSetup"] = 0;

    alexaContext.handler.state = states.SETUP_USERS;

    alexaContext.attributes["players"] = [];

    const askPlayerName = playerQuantity == 1 ? alexaContext.t("SINGLE_PLAYER_RESPONSE") : alexaContext.t("FIRST_PLAYER_RESPONSE");
    alexaContext.emit(':ask', askPlayerName, alexaContext.t("REPROMT_FIRST_PLAYER"));
};

const startModeHandlers = Alexa.CreateStateHandler(states.START_MODE, {
    'GetPlayerNumber': function () {
        const playerQuantity = this.event.request.intent.slots.PlayerQuantity.value;

        this.attributes["playerQuantity"] = playerQuantity;
        askPlayerName(this, playerQuantity);
    },

    'GetOnePlayer': function () {
        this.attributes["playerQuantity"] = 1;
        this.attributes["currentPlayerSetup"] = 0;

        askPlayerName(this, 1);
    },
    'Unhandled': function () {
        this.emit(":ask", this.t("UNHANDLED_QUANTITY"), this.t("UNHANDLED_QUANTITY_REPROMT"));
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});

const setupUsersHandlers = Alexa.CreateStateHandler(states.SETUP_USERS, {
    'GetContestantName': function () {
        const playerName = this.event.request.intent.slots.PlayerName.value;
        const currentPlayer = this.attributes["currentPlayerSetup"];

        let finishedRegistration = false;
        if (currentPlayer + 1 >=  this.attributes["playerQuantity"]) {
            this.handler.state = states.GAME_ROUND;
            finishedRegistration = true;
        }

        this.attributes["players"][currentPlayer] = {
            name: playerName,
        };

        if (finishedRegistration) {
            const firstPlayer = this.attributes["players"][0];
            const productChoice = product.getProduct();
            let productEmision = "Okay, let's start the game: " + firstPlayer.name;
            productEmision += " " + this.t("PRESENT_THE_PRODUCT") + productChoice.name + ", " + productChoice.description;
            productEmision += ". " + getGuessThePricePhrase(this);
            const imageObj = {
                smallImageUrl: productChoice.image,
                largeImageUrl: productChoice.image
            };

            this.attributes["currentPlayerGame"] = 0;

            this.attributes["currentProduct"] = productChoice;
            this.attributes["currentRound"] = 0;

            this.emit(':askWithCard', productEmision, productEmision, productChoice.name, productChoice.description, imageObj);
        } else {
            this.attributes["currentPlayerSetup"] = currentPlayer + 1;

            const askPlayerName = "Contestant " +  (currentPlayer + 2) +" " + this.t("TELL_YOUR_NAME_QUESTION");
            this.emit(':ask', askPlayerName, askPlayerName);
        }
    },
    'Unhandled': function () {
        this.emit(":ask", this.t("UNHANDLED_USER_NAME"), this.t("UNHANDLED_USER_NAME_REPROMT"));
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});

const gameRoundHandlers = Alexa.CreateStateHandler(states.GAME_ROUND, {
    'GetContestantPrice': function () {
        const contestantPrice = this.event.request.intent.slots.Price.value;
        const lastProduct = this.attributes["currentProduct"];
        const currentPlayerIndex = this.attributes["currentPlayerGame"];
        const currentPlayer = this.attributes["players"][currentPlayerIndex];
        const playerQuantity = this.attributes["playerQuantity"];
        const yourPriceIsSpeech = (playerQuantity > 1 ? currentPlayer.name + ", you" : " You") +
            " said " + contestantPrice +  " , the actual price was " + lastProduct.price + " dollars. ";
        const score = game.getScore(contestantPrice, lastProduct.price);
        const currentRound = this.attributes["currentRound"];

        if (currentRound > 0) {
            this.attributes["players"][currentPlayerIndex]["score"].push(score);
        } else {
            this.attributes["players"][currentPlayerIndex]["score"] = [score];
        }

        const productChoice = product.getProduct();

        const endOfRound = currentPlayerIndex + 1 >= playerQuantity;
        let nextQuestion;
        if (endOfRound) {
            this.attributes["currentRound"] = currentRound + 1;
            if (currentRound + 1 >= 3) {
                this.handler.state = states.TELL_SCORE;
                if (this.attributes["playerQuantity"] === 1) {
                    const finalPlayerScoreList = this.attributes["players"][0]["score"];
                    const finalScore = finalPlayerScoreList.reduce((acc, val) => acc + val);
                    this.emit(':tell', "Game ended, your final score was: " + finalScore);
                } else {
                    const players = this.attributes["players"];
                    const winner = players.reduce((result, player) => {
                        const playerScore = player.score.reduce((acc, val) => acc + val);
                        if (!result.finalScore || result.finalScore < playerScore) {
                            result = Object.assign({}, player);
                            result.finalScore = playerScore;
                        }
                        return result;
                    }, {});
                    const finalResults =
                        "Game ended, the winner is " + winner.name + " with " + winner.finalScore + " points. Congratulations!";
                    this.emit(':tell', finalResults);
                }
            }
        }
        if (this.attributes["playerQuantity"] === 1) {
            nextQuestion = "Your next product is ";
        } else {
            const nextPlayerIndex = !endOfRound ?  currentPlayerIndex + 1 : 0;
            const nextPlayer = this.attributes["players"][nextPlayerIndex];
            this.attributes["currentPlayerGame"] = nextPlayerIndex;
            nextQuestion = "Now is " + nextPlayer.name + " turn. Your next product is ";
        }

        this.attributes["currentProduct"] = productChoice;

        nextQuestion += productChoice.name + ", " + productChoice.description;
        nextQuestion += "   " + getGuessThePricePhrase(this);

        const imageObj = {
            smallImageUrl: productChoice.image,
            largeImageUrl: productChoice.image
        };

        const speechOutput = yourPriceIsSpeech + this.t("SCORE") + score + " points. " + nextQuestion;

        const repromt = this.t("GUESS_THE_PRICE_REPROMT") + productChoice.name;

        this.emit(':askWithCard', speechOutput, repromt, productChoice.name, productChoice.description, imageObj);
    },
    'Unhandled': function () {
        this.emit(":ask", this.t("UNHANDLED_PRICE"), this.t("UNHANDLED_PRICE_REPROMT"));
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
});


var handlers = {
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_MESSAGE");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
};
