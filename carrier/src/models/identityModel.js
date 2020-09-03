/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const fs = require('fs');
const os = require('os');
const path = require('path');
const log4js = require('log4js');

const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

const logger = log4js.getLogger('IdentityManager');
const roleMap = { client: "carrier" };

class IdentityManager {
	constructor() {
		this.initialized = false;
		this.walletDirectoryPath = null;
		this.connectionProfile = null;
		this.gateway = null;

        this.configPath = process.env.CONFIG_PATH || '/config';
        this.orgName = process.env.ORG_NAME || 'carrierorg';
        this.orgMSP = process.env.ORG_MSP || 'CarrierOrgMSP';

        this.walletDirectoryPath = path.join(this.configPath, 'wallets', this.orgName, this.orgMSP);
        if (!fs.existsSync(this.walletDirectoryPath)) {
            fs.mkdirSync(this.walletDirectoryPath);
        }
        this.connProfilePath = path.join(this.configPath, 'gateways', this.orgName, 'connection.json');
        const data = fs.readFileSync(this.connProfilePath, 'utf8');
        this.connectionProfile = JSON.parse(data);
    }
    
    async init() {
        const msp = this.connectionProfile.client.organization;
        const caName = this.connectionProfile.organizations[msp].certificateAuthorities[0];
        const caInfo = this.connectionProfile.certificateAuthorities[caName];
        const caTLSCACerts = caInfo.tlsCACerts.pem;

        this.wallet = await Wallets.newFileSystemWallet(this.walletDirectoryPath);
        this.ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
    }

    async registerAndEnrollUser(adminId, adminPassword, enrollId, enrollPassword, role, cb) {
        try {
            await this.enrollUser(adminId,adminPassword);
            await this.registerUser(adminId,enrollId,enrollPassword,role);
            await this.enrollUser(enrollId,enrollPassword);
            cb(true,null);
        } catch(err) {
            cb(false,err);
        }
    }


    async enrollUser(enrollId, enrollPassword) {
        logger.info('Verifying if user ' + enrollId + ' exist in wallet.');
        if (await this.wallet.get(enrollId) !== undefined) {
            logger.info('User ' + enrollId + ' found in the wallet. Skipping enrollment.');
            return;
        }
        logger.info('Enrolling id ' + enrollId);

        const enrollment = await this.ca.enroll({ enrollmentID: enrollId, enrollmentSecret: enrollPassword });
        const x509Identity = {
            credentials: {
                certificate:  enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: this.orgMSP,
            type: 'X.509',
        };

        await this.wallet.put(enrollId, x509Identity);
    }

    async registerUser(adminId, enrollId, enrollPassword, role) {
        const gateway = new Gateway();
        try {
            await gateway.connect(this.connectionProfile, { wallet: this.wallet, identity: adminId, discovery: { enabled: true, asLocalhost: false } });

            // Get the Admin Identity.
            const adminIdentity = gateway.getIdentity();
            const provider = this.wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            try {
                await this.ca.newIdentityService().getOne(enrollId, adminUser);
            } catch(err) {
                const attribute = {
                    name: "BUSINESS_ROLE",
                    value: this.mapRole(role),
                    ecert: true
                };
                const attributeList = [ attribute ];
                await this.ca.register({ enrollmentID: enrollId, enrollmentSecret: enrollPassword, maxEnrollments: -1, attrs: attributeList }, adminUser);
            }
        } finally {
            gateway.disconnect();
        }
    }

    mapRole(role) {
        const fabric_role = roleMap[role.toLowerCase()];
        if (!fabric_role) {
            throw new Error("Role is not recognized:" + role);
        }
        return fabric_role;
    }
}

module.exports = IdentityManager;
