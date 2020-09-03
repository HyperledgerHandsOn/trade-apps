/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const log4js = require('log4js');
const { Wallets, Gateway, X509WalletMixin } = require('fabric-network');

const logger = log4js.getLogger('LetterOfCreditManager');

class LetterOfCreditManager {
	constructor() {
		this.channelName = 'tradechannel';
		this.gateway = null;

		// Default path '/config' applies when running REST server within docker.
        this.configPath = process.env.CONFIG_PATH || '/config';
        this.orgName = process.env.ORG_NAME || 'exporterorg';
        this.orgMSP = process.env.ORG_MSP || 'ExporterOrgMSP';

        this.walletDirectoryPath = path.join(this.configPath, 'wallets', this.orgName, this.orgMSP);
        this.connProfilePath = path.join(this.configPath, 'gateways', this.orgName, 'connection.json');
        const data = fs.readFileSync(this.connProfilePath, 'utf8');
        this.connectionProfile = JSON.parse(data);
	}

	async init(userId) {		
		try {
			logger.info('Calling init with: ' + userId + '.');
			this.wallet = await Wallets.newFileSystemWallet(this.walletDirectoryPath);
			const connectionOptions = { wallet: this.wallet, identity: userId, discovery: { enabled: true, asLocalhost: false } };

			this.gateway = new Gateway();
			await this.gateway.connect(this.connectionProfile, connectionOptions);

			logger.info('Using network channel: ' + this.channelName + '.');
			this.network = await this.gateway.getNetwork(this.channelName);

			logger.info('With trade contract.');
			this.lcContract = this.network.getContract('letterOfCredit');
		} catch (error) {
			logger.error(`Error processing transaction. ${error}`);
			logger.error(error.stack);
			throw error;
		}
	}

	getCurrentIdentity() {
		if (this.gateway) {
			return this.gateway.getIdentity();
		} else {
			return null;
		}
	}

	async disconnect() {
		if (this.gateway) {
			await this.gateway.disconnect();
			this.gateway = null;
		}
	}

	async getLetterOfCredit(tradeId, cb) {
		logger.info('Invoking getLC: Get Letter of Credits for which the exporter is involved.');
		try {
			let lcBuffer = await this.lcContract.evaluateTransaction('getLC', tradeId);
			let lc = JSON.parse(lcBuffer.toString());

			cb(lc, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async getLetterOfCreditStatus(tradeId, cb) {
		logger.info('Invoking getLCStatus: Get status of Letter of Credit for which the exporter is involved.');
		try {
			let lcStatusBuffer = await this.lcContract.evaluateTransaction('getLCStatus', tradeId);
			let lcStatus = JSON.parse(lcStatusBuffer.toString());

			cb(lcStatus, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async acceptLetterOfCredit(tradeId, cb) {
		logger.info('Invoking acceptLetterOfCredit: Accept a letter of credit proposed by an Importer\'s Bank.');
		try {
			await this.lcContract.submitTransaction('acceptLC', tradeId);

			cb(true, null);
		} catch(err) {
			logger.error(err);
			cb(false, err);
		}
	}

	async requestPayment(tradeId, cb) {
		logger.info('Invoking requestPayment: Requesting a payment for a shipment of goods.');
		try {
			await this.lcContract.submitTransaction('requestPayment', tradeId);

			cb(true, null);
		} catch(err) {
			logger.error(err);
			cb(false, err);
		}
	}

	async getAccountBalance(cb) {
		logger.info('Invoking getAccountBalance: Get exporter\'s account balance.');
		try {
			let accountBalanceBuffer = await this.lcContract.evaluateTransaction('getAccountBalance');
			let accountBalance = JSON.parse(accountBalanceBuffer.toString());

			cb(accountBalance, null);
		} catch(err) {
			cb(null, err);
		}
	}
}

module.exports = LetterOfCreditManager;
