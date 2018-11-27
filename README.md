[![Build Status](https://travis-ci.org/bennorwood/pr-bot.svg?branch=master)](https://travis-ci.org/bennorwood/pr-bot)

#PR Bot

A simple NodeJs server to fetch github open pull requests of pre-defined users. The response is based on slack attachment format so that it can be nicely displayed in slack.

## Configuration

### Needed Environment Variables
 - NODE_ENV: test | dev
 - SLACK_WEBHOOK_URL: name of the environment variable the contains the slack incoming webhook url to hit for testing purposes
 - SIGNING_SECRET: unique slack secret to verify that requests are actually from slack
 - USERNAME: Github username for basic authentication
 - OATH_TOKEN_NAME: Github token or password for basic authentication against the github api

## Running the server
### To run the server normally execute the following command:

```
npm start
```

## Deploying in Heroku
 See https://devcenter.heroku.com/articles/deploying-nodejs for more info