/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const log4js = require('log4js');
const { Wallets, Gateway, X509WalletMixin } = require('fabric-network');

const logger = log4js.getLogger('ShipmentManager');

class ShipmentManager {
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

			logger.info('With shipment contract.');
			this.shipmentContract = this.network.getContract('shipment');
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

	async getShipmentLocation(tradeId, cb) {
		logger.info('Invoking getShipmentLocation: Get Shipment Location for the exporter.');
		try {
			let slBuffer = await this.shipmentContract.evaluateTransaction('getShipmentLocation', tradeId);
			let shipmentlocation = JSON.parse(slBuffer.toString());

			cb(shipmentlocation, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async getBillOfLading(tradeId, cb) {
		logger.info('Invoking getBillOfLading: Get Bill of Lading for the exporter.');
		try {
			let blBuffer = await this.shipmentContract.evaluateTransaction('getBillOfLading', tradeId);
			let bl = JSON.parse(blBuffer.toString());

			cb(bl, null);
		} catch(err) {
			cb(null, err);
		}
	}

	async prepareShipment(tradeId, carrierMSP, descriptionOfGoods, amount, beneficiary, cb) {
		logger.info('Invoking prepareShipment: Preparing a shipment of goods.');
		try {
			await this.shipmentContract.submitTransaction('prepareShipment', tradeId, carrierMSP, descriptionOfGoods, amount, beneficiary);

			cb(true, null);
		} catch(err) {
			logger.error(err);
			cb(false, err);
		}
	}
}

module.exports = ShipmentManager;
