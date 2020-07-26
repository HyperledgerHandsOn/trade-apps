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

    async accept_shipment_issue_bol(req, res) {
        logger.info("Accepting shipment and issuing bill of lading.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
            return;
        }
        var blId = req.body.blId;
        if (!blId) {
            res.status(500);
            res.send({ error:"Missing argument blId in JSON."});
            return;
        }
        var expirationDate = req.body.expirationDate;
        if (!expirationDate) {
            res.status(500);
            res.send({ error:"Missing argument expirationDate in JSON."});
            return;
        }
        var sourcePort = req.body.sourcePort;
        if (!sourcePort) {
            res.status(500);
            res.send({ error:"Missing argument sourcePort in JSON."});
            return;
        }
        var destinationPort = req.body.destinationPort;
        if (!destinationPort) {
            res.status(500);
            res.send({ error:"Missing argument destinationPort in JSON."});
            return;
        }
        try {
            this.shipManager.acceptShipmentAndIssueBL(tradeId, blId, expirationDate, sourcePort, destinationPort, function (results, err) {
                if (err) {
                    console.log("Encountered an error accepting shipment and issuing bill of lading.", err);
                    res.status(500);
                    res.send({ error: err });
                } else {
                    console.log("Succesfully accepted a shipment and issued bill of lading", results);
                    res.send(results);
                }
            });
        } catch(err) {
            logger.error(err);
            res.status(500);
            res.send({ error: err });
        }
    }

    async update_shipment_location(req, res) {
        logger.info("Updating shipment location.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
            return;
        }
        var location = req.body.location;
        if (!location) {
            res.status(500);
            res.send({ error:"Missing argument location in JSON."});
            return;
        }
        try {
            this.shipManager.updateShipmentLocation(tradeId, location, function (results, err) {
                if (err) {
                    console.log("Encountered an error updating shipment location.", err);
                    res.status(500);
                    res.send({ error: err });
                } else {
                    console.log("Succesfully updated shipment location", results);
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
