/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const log4js = require('log4js');
const LetterOfCreditManager = require('../models/letterOfCreditModel.js');

const logger = log4js.getLogger('LetterOfCreditController');

class LetterOfCreditController {
    constructor() {
        this.locManager = new LetterOfCreditManager();
    }

    async init() {
    }

    async validateIdentity(req, res) {
        if (this.locManager.getCurrentIdentity() !== req.username) {
            logger.info('Switching to identity ' + req.username);
            await this.locManager.disconnect();
            await this.locManager.init(req.username);
        }
    }

    async letter_details(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.locManager.getLetterOfCredit(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving letter of credit details.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received letter of credit details", results);
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

    async letter_status(req, res) {
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.locManager.getLetterOfCreditStatus(tradeId, function (results, err) {
                    if (err) {
                        logger.error("Encountered an error retrieving letter of credit status.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        logger.info("Received letter of credit status", results);
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

    async accept_letter(req, res) {
        logger.info("Accepting letter of credit.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.locManager.acceptLetterOfCredit(tradeId, function (results, err) {
                    if (err) {
                        console.log("Encountered error accepting a letter of credit.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        console.log("Succesfully accepted a letter of credit", results);
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

    async request_payment(req, res) {
        logger.info("Requesting payment.");
        var tradeId = req.params.tradeId;
        if (!tradeId) {
            res.status(500);
            res.send({ error:"Missing parameter tradeId."});
        } else {
            try {
                this.locManager.requestPayment(tradeId, function (results, err) {
                    if (err) {
                        console.log("Encountered error requesting a payment.", err);
                        res.status(500);
                        res.send({ error: err });
                    } else {
                        console.log("Succesfully requested a payment", results);
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

    async account_balance(req, res) {
        logger.info("Getting account balance.");
        try {
            this.locManager.getAccountBalance(function (results, err) {
                if (err) {
                    console.log("Encountered error fetching account balance.", err);
                    res.status(500);
                    res.send({ error: err });
                } else {
                    console.log("Succesfully obtained account balance", results);
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

module.exports = LetterOfCreditController;
