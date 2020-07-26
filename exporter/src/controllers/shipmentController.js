/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const log4js = require('log4js');
const ShipmentManager = require('../models/shipmentModel.js');

const logger = log4js.getLogger('ShipmentController');

class ShipmentController {
    constructor() {
        this.shipManager = new ShipmentManager();
    }

    async init() {
    }

    async validateIdentity(req, res) {
        if (this.shipManager.getCurrentIdentity() !== req.username) {
            logger.info('Switching to identity ' + req.username);
            await this.shipManager.disconnect();
            await this.shipManager.init(req.username);
        }
    }

    async shipment_location(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.shipManager.getShipmentLocation(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving shipment location.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received shipment location", results);
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

    async shipment_bol(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.shipManager.getBillOfLading(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving bill of lading.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received bill of lading", results);
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

    async prepare_shipment(req, res) {
        logger.info("Preparing shipment.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
            return;
        }
        var carrierMSP = req.body.carrierMSP;
        if (!carrierMSP) {
            res.status(500);
            res.send({ error:"Missing argument carrierMSP in JSON."});
            return;
        }
        var descriptionOfGoods = req.body.descriptionOfGoods;
        if (!descriptionOfGoods) {
            res.status(500);
            res.send({ error:"Missing argument descriptionOfGoods in JSON."});
            return;
        }
        var amount = req.body.amount;
        if (!amount) {
            res.status(500);
            res.send({ error:"Missing argument amount in JSON."});
            return;
        }
        if (isNaN(amount)) {
            res.status(500);
            res.send({ error:"Argument amount in JSON is not a number."});
            return;
        }
        var beneficiary = req.body.beneficiary;
        if (!beneficiary) {
            res.status(500);
            res.send({ error:"Missing argument beneficiary in JSON."});
            return;
        }
        try {
            this.shipManager.prepareShipment(tradeId, carrierMSP, descriptionOfGoods, amount, beneficiary, function (results, err) {
                if (err) {
                    console.log("Encountered an error preparing shipment.", err);
                    res.status(500);
                    res.send({ error: err });
                } else {
                    console.log("Succesfully prepared a shipment", results);
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

module.exports = ShipmentController;
