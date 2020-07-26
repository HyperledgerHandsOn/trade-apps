/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const log4js = require('log4js');
const ExportLicenseManager = require('../models/exportLicenseModel.js');

const logger = log4js.getLogger('ExportLicenseController');

class ExportLicenseController {
    constructor() {
        this.elManager = new ExportLicenseManager();
    }

    async init() {
    }

    async validateIdentity(req, res) {
        if (this.elManager.getCurrentIdentity() !== req.username) {
            logger.info('Switching to identity ' + req.username);
            await this.elManager.disconnect();
            await this.elManager.init(req.username);
        }
    }

    async license_details(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.elManager.getExportLicense(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving export license details.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received export license details", results);
                        res.send(results);
                    }
                });
            } catch(err) {
                logger.error(err);
                res.status(500);
                res.send({ error: err });
            }
        }
    }

    async license_status(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.elManager.getExportLicenseStatus(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving export license status.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received export license status", results);
                        res.send(results);
                    }
                });
            } catch(err) {
                logger.error(err);
                res.status(500);
                res.send({ error: err });
            }
        }
    }

    async request_license(req, res) {
        logger.info("Requesting export license.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.elManager.requestExportLicense(tradeId, function (results, err) {
                    if (err) {
                        console.log("Encountered an error requesting export license.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        console.log("Succesfully requested an export license", results);
                        res.send(results);
                    }
                });
            } catch(err) {
                logger.error(err);
                res.status(500);
                res.send({ error: err });
            }
        }
    }
}

module.exports = ExportLicenseController;
