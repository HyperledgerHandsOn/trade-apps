/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const log4js = require('log4js');
const { Wallets, Gateway, X509WalletMixin } = require('fabric-network');

const logger = log4js.getLogger('ExportLicenseManager');

class ExportLicenseManager {
	constructor() {
		this.channelName = 'shippingchannel';
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

			logger.info('With exportLicense contract.');
			this.elContract = this.network.getContract('exportLicense');
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

	async getExportLicense(tradeId, cb) {
		logger.info('Invoking getEL: Get Export License for the exporter.');
		try {
			let elBuffer = await this.elContract.evaluateTransaction('getEL', tradeId);
			let el = JSON.parse(elBuffer.toString());

			cb(el, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async getExportLicenseStatus(tradeId, cb) {
		logger.info('Invoking getELStatus: Get Export License status for the exporter.');
		try {
			let elStatusBuffer = await this.elContract.evaluateTransaction('getELStatus', tradeId);
			let elStatus = JSON.parse(elStatusBuffer.toString());

			cb(elStatus, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async requestExportLicense(tradeId, cb) {
		logger.info('Invoking requestExportLicense: Request an export license before shipping goods.');
		try {
			await this.elContract.submitTransaction('requestEL', tradeId);

			cb(true, null);
		} catch(err) {
			logger.error(err);
			cb(false, err);
		}
	}
}

module.exports = ExportLicenseManager;
