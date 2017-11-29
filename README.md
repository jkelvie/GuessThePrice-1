[![CircleCI](https://circleci.com/gh/bespoken/GuessThePrice.svg?style=svg)](https://circleci.com/gh/bespoken/GuessThePrice)
[![codecov](https://codecov.io/gh/bespoken/GuessThePrice/branch/VirtualDeviceSDK/graph/badge.svg)](https://codecov.io/gh/bespoken/GuessThePrice)

# Guess The Price
Showcase for Bespoken Unit-Testing and Integration-Testing tools!  
Also, fun game for guessing prices, akin to the Price Is Right!

## Continuous Integration
Done via CircleCI - core testing is here:
```
test:
  override:
    - npm test
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
      - npm run integration
      - deploy.sh Dev

  prod:
    tag: /prod-.*/
    commands:
      - npm run integration
      - deploy.sh Prod
```

The integration tests are run first and leverage our [Virtual Device SDK](https://github.com/bespoken/virtual-device-sdk).

If they are successful, our deployment script is run.

### Deployment Script
We use our script in deploy.sh to orchestrate:
* Setting up config files (AWS and ASK)
* Uploading Lambda

This is done with bash because it is the easiest, most concise way to setup the config files in a prisitine environment.

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

## End-To-End Testing
As mentioned, the integration tests use our [Virtual Device SDK](https://github.com/bespoken/virtual-device-sdk).

```
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
    assert.include(result.transcript, "the actual price was");
});
```

## TODO
* Add automated interaction model re-deployment
