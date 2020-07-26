/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const log4js = require('log4js');
const TradeManager = require('../models/tradeModel.js');

const logger = log4js.getLogger('TradeController');

class TradeController {
    constructor() {
        this.tradeManager = new TradeManager();
    }

    async init() {
    }

    async validateIdentity(req, res) {
        if (this.tradeManager.getCurrentIdentity() !== req.username) {
            logger.info('Switching to identity ' + req.username);
            await this.tradeManager.disconnect();
            await this.tradeManager.init(req.username);
        }
    }

    async list_trades(req, res) {
        try {
            this.tradeManager.getTrades(function (results, err) {
                if (err) {
                    logger.error("Encountered an error retrieveing list of trades.", err);
                    res.status(500);
                    res.send({ error: err });
                } else {
                    logger.info("Received list of trades", results);
                    res.send(results);
                }
            });
        } catch(err) {
            logger.error(err);
            res.status(500);
            res.send({ error: err });
        }
    }

    async trade_details(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.tradeManager.getTradeDetails(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving trade details.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received trade details", results);
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

    async trade_status(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.tradeManager.getTradeStatus(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving trade status.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received trade status", results);
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

    async accept_trade(req, res) {
        logger.info("Accepting trade.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.tradeManager.acceptTrade(tradeId, function (results, err) {
                    if (err) {
                        console.log("Encountered an error accepting a Trade.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        console.log("Succesfully accepted a trade", results);
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

module.exports = TradeController;
