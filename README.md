[![CircleCI](https://circleci.com/gh/bespoken/GuessThePrice.svg?style=svg)](https://circleci.com/gh/bespoken/GuessThePrice)
[![codecov](https://codecov.io/gh/bespoken/GuessThePrice/branch/master/graph/badge.svg)](https://codecov.io/gh/bespoken/GuessThePrice)


# Guess The Price
Showcase for Bespoken unit-testing and end-to-end testing tools!
Also, fun game for guessing prices, akin to the Price Is Right!! 

## Continuous Integration
Done via CircleCI - core testing is here:
```
test:
  override:
    - bst test test
    - codecov
```

Look at the [entire circle.yml here](circle.yml).

## Continuous Deployment
### Environment Rules
We deploy to a dev lambda automatically with every commit to master.

Additionally, we deploy to prod for tags that start with "prod-*".

In this way, prod builds are triggered explicitly but easily. The relevant portion of the Circle file is below:
```
deployment:
  dev:
    branch: master
    commands:
      - ./deploy.sh Dev
      - bst test test

  prod:
    tag: /prod-.*/
    commands:
      - ./deploy.sh Prod
      - bst test e2e
```

[Unit](https://read.bespoken.io/unit-testing/getting-started/) and [end-to-end](https://read.bespoken.io/end-to-end/getting-started/) tests are run first and leverage our Skill Tester, Virtual Alexa and Virtual Device.

If they are successful, our deployment script is run.

### Deployment Script
We use our deploy.sh script to orchestrate:
* Setting up config files (AWS and ASK)
* Uploading to Lambda

This is done with a bash script because of the powerful tools it provides for file manipulation and creation.

These lines setup our AWS and ASK configs from environment variables configured securely in Circle:
```
echo "[default]" > ~/.aws/credentials
echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> ~/.aws/credentials
echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> ~/.aws/credentials

sed -e s/ASK_ACCESS_TOKEN/${ASK_ACCESS_TOKEN}/g -e \
    s/ASK_REFRESH_TOKEN/${ASK_REFRESH_TOKEN}/g conf/ask_cli.json > ~/.ask/cli_config
```

Once done, the ASK CLI is run to deploy the new Lambda version.

See the [entire deploy.sh here](deploy.sh).

## Unit-testing
There is no need to add assertions to your code. With our automated unit-testing you create simple [YAML test scripts](https://read.bespoken.io/unit-testing/getting-started/) and then we run them against your code locally.

```yaml
---
configuration: # This is the configuration section, you can define your locale or the mocks here
  locale: en-US
  
---
- test: "Sequence 02. Test scenario: launch request, play once with two players and cancel."
- LaunchRequest: "how many persons are playing today"
- 2: "contestant one please tell us, what is your name"
- jordi: "Contestant 2 please tell us, what is your name"
- caterina: "let's start the game: jordi your product is Fitbit Charge 2 HR* Guess the price"
- 149: "you said 149 , the actual price was 149 dollars. Your score for that answer is 1000 points. Now is caterina turn"
- 4143: "Now is jordi turn. Your next product is"
- cancel: "Goodbye!"
```

## TODO
* Add automated interaction model re-deployment
