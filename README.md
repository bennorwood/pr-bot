[![Build Status](https://travis-ci.org/bennorwood/pr-bot.svg?branch=master)](https://travis-ci.org/bennorwood/pr-bot)

#PR Bot

A simple NodeJs server to fetch github open pull requests of pre-defined users. The response is based on slack attachment format so that it can be nicely displayed in slack.

## Configuration

### Needed Environment Variables
- NODE_ENV: test | dev

The following app config names specify a string environment variable name where the value can be found.
 
 - SLACK_WEBHOOK_URL: the slack incoming webhook url to hit for testing purposes
 - slack.SIGNING_SECRET: unique slack secret to verify that requests are actually from slack
 - github.USERNAME: Github username for basic authentication
 - github.OATH_TOKEN_NAME: Github token or password for basic authentication against the github api
 - teams.platform.slackIncomingWebhookURL: url that app can post updates to freely

 Note every team needs a corresponding slack incoming webhook url that the app can post messages to.

## Testing
To run tests:
```
npm test
```

To run linting:
```
npm run lint
```

## Running the server
### To run the server normally execute the following command:
```
npm start
```

## Deploying in Heroku
 See https://devcenter.heroku.com/articles/deploying-nodejs for more info