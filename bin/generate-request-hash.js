#!/usr/bin/env node

// To run: NODE_ENV=test ./bin/generate-request-hash.js
const chalk = require('chalk');
const { argv } = require('yargs');
const clipboardy = require('clipboardy');
const container = require('../container');

const version = container.get('config').get('slack.version');
const cryptoService = container.get('cryptoService');
const padString = '*********************************************************************';
const whitespace = ''.padStart(padString.length, ' ');

function displayHelp() {
    console.log();
    console.log();
    console.log(chalk.white(padString + padString));
    console.log(chalk.white('* Generate Signed Slack Signature                                 ', whitespace, '*'));
    console.log(chalk.white('*                                                                 ', whitespace, '*'));
    console.log(chalk.white('* To Execute, Run:                                                ', whitespace, '*'));
    console.log(chalk.white('*  NODE_ENV=test ./bin/generate-request-hash.js --body=<REQUEST_BODY> --timestamp=1543273102', whitespace.substr(26), '*'));
    console.log(chalk.white(padString + padString));
    console.log();
    console.log();
}

function extractArgs() {
    return {
        body: argv.body,
        timestamp: argv.timestamp,
        version
    };
}

function convertBodyToSignature(opts) {
    const token = [opts.version, opts.timestamp, opts.body].join(':');
    return cryptoService.signSlackRequest(token);
}

function copyToClipboardAndDisplayResults(payload) {
    clipboardy.writeSync(payload);
    console.log();
    console.log();
    console.log(chalk.cyan(padString + padString));
    console.log(chalk.cyan('* Generated Signed Signature! Copied to Clipboard                 ', whitespace, '*'));
    console.log(chalk.cyan('*', ''.padStart((padString.length * 2) - 4, ' '), '*'));
    console.log(chalk.cyan('*', payload.padEnd((padString.length * 2) - 4, ' '), '*'));

    console.log(chalk.cyan(padString + padString));
    console.log();
    console.log();
}

function run() {
    if ('help' in argv || 'h' in argv || '?' in argv) {
        displayHelp();
        process.exit(0);
    }

    copyToClipboardAndDisplayResults(convertBodyToSignature(extractArgs()));
}


run();
