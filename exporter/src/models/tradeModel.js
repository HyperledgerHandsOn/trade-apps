/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const log4js = require('log4js');
const { Wallets, Gateway, X509WalletMixin } = require('fabric-network');

const logger = log4js.getLogger('TradeManager');

class TradeManager {
	constructor() {
		this.channelName = 'tradechannel';
		this.gateway = null;

		// Default path '/config' applies when running REST server as docker.
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
			this.tradeContract = this.network.getContract('trade');
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

	async getTrades(cb) {
		logger.info('Invoking getTrades: Get All Trades where the exporter is involved.');
		try {
			let tradeListBuffer = await this.tradeContract.evaluateTransaction('listTrade');
			let tradeList = JSON.parse(tradeListBuffer.toString());

			cb(tradeList, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async getTradeDetails(tradeId, cb) {
		logger.info('Invoking getTradeDetails: Get the detail of a Trade where the exporter is involved.');
		try {
			let tradeDetailsBuffer = await this.tradeContract.evaluateTransaction('getTrade', tradeId);
			let trade = JSON.parse(tradeDetailsBuffer.toString());

			cb(trade, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async getTradeStatus(tradeId, cb) {
		logger.info('Invoking getTradeStatus: Get the status of a Trade where the exporter is involved.');
		try {
			let tradeDetailsBuffer = await this.tradeContract.evaluateTransaction('getTradeStatus', tradeId);
			let tradeStatus = JSON.parse(tradeDetailsBuffer.toString());

			cb(tradeStatus, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async acceptTrade(tradeId, cb) {
		logger.info('Invoking acceptTrade: Accept a trade proposed by an Importer.');
		try {
			await this.tradeContract.submitTransaction('acceptTrade', tradeId);

			cb(true, null);
		} catch(err) {
			logger.error(err);
			cb(false, err);
		}
	}
}

module.exports = TradeManager;
