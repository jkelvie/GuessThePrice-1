echo "ENV: $1"

# Create the .aws and .ask directories
mkdir ~/.aws
mkdir ~/.ask

# Create AWS credentials
echo "[default]" > ~/.aws/credentials
echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> ~/.aws/credentials
echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> ~/.aws/credentials

# Create ASK config
sed -e s/ASK_ACCESS_TOKEN/${ASK_ACCESS_TOKEN}/g -e \
    s/ASK_REFRESH_TOKEN/${ASK_REFRESH_TOKEN}/g conf/ask_cli.json > ~/.ask/cli_config

# Create the Lambda upload file and deploy it
npm run package
ask lambda upload -f GuessThePrice-$1 -s artifact.zip