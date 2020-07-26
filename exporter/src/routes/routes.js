/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

var bearerToken = require('express-bearer-token');
var jwt = require('jsonwebtoken');
var log4js = require('log4js');
var util = require('util');

var logger = log4js.getLogger('TradeExporterApp');
var TradeController = require('../controllers/tradeController');
var LetterOfCreditController = require('../controllers/letterOfCreditController');
var IdentityController = require('../controllers/identityController');
var ExportLicenseController = require('../controllers/exportLicenseController');
var ShipmentController = require('../controllers/shipmentController');

module.exports = async function (app) {
    const tradeCtrl = new TradeController();
    const identityCtrl = new IdentityController();
    const locCtrl = new LetterOfCreditController();
    const elCtrl = new ExportLicenseController();
    const shipCtrl = new ShipmentController();

    await elCtrl.init();
    await tradeCtrl.init();
    await locCtrl.init();
    await shipCtrl.init();
    await identityCtrl.init();

    app.use(bearerToken());
    app.use(function (req, res, next) {
        logger.info(' ------>>>>>> new request for %s', req.originalUrl);
        if (req.originalUrl.indexOf('/login') >= 0 || req.originalUrl.indexOf('/register') >= 0) {
            return next();
        }
    
        var token = req.token;
        jwt.verify(token, app.get('secret'), async function (err, decoded) {
            if (err) {
                res.send({
                    success: false,
                    message: 'Failed to authenticate token. Make sure to include the ' +
                        'token returned from /login call in the authorization header ' +
                        ' as a Bearer token'
                });
                return;
            } else {
                // add the decoded user name and org name to the request object
                // for the downstream code to use
                req.username = decoded.username;
                logger.info(util.format('Decoded from JWT token: username - %s', decoded.username));
                await tradeCtrl.validateIdentity(req, res);
                await locCtrl.validateIdentity(req, res);
                await elCtrl.validateIdentity(req, res);
                await shipCtrl.validateIdentity(req, res);
                return next();
            }
        });
    });

    app.post('/login', async function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        logger.info('User name for login/registration : ' + username);
        if (!username) {
            var response = {
                success: false,
                message: '\' username\' field is missing or Invalid in the request'
            };
            res.json(response);
            return;
        }

        var token = jwt.sign({
            // Make the token expire 60 seconds from now
            exp: Math.floor(Date.now() / 1000) + (69 * 60),	
            username: username
        }, app.get('secret'));
        
        try {
            var resp = {};
            resp.token = token;
            resp.success = true;
            resp.message = 'Login successful';
            res.json(resp);
        } catch(err) {
            res.status(500);
            res.send({ error: err });
        }
    });

    app.post('/register', async function(req,res) {
        identityCtrl.register(req,res)
    });

    app.get('/trade', async function(req,res) {
        tradeCtrl.list_trades(req,res);
    });

    app.get('/trade/:tradeId', async function(req,res) {
        tradeCtrl.trade_details(req,res);
    });

    app.get('/trade/:tradeId/status', async function(req,res) {
        tradeCtrl.trade_status(req,res);
    });

    app.get('/trade/:tradeId/accept_trade', async function(req,res) {
        tradeCtrl.accept_trade(req,res);
    });

    app.get('/loc/:tradeId', async function(req,res) {
        locCtrl.letter_details(req,res);
    });

    app.get('/loc/:tradeId/status', async function(req,res) {
        locCtrl.letter_status(req,res);
    });

    app.get('/loc/:tradeId/accept_letter', async function(req,res) {
        locCtrl.accept_letter(req,res);
    });

    app.get('/payment/:tradeId/request', async function(req,res) {
        locCtrl.request_payment(req,res);
    });

    app.get('/account_balance', async function(req,res) {
        locCtrl.account_balance(req,res);
    });

    app.get('/el/:tradeId/request', async function(req,res) {
        elCtrl.request_license(req,res);
    });

    app.get('/el/:tradeId', async function(req,res) {
        elCtrl.license_details(req,res);
    });

    app.get('/el/:tradeId/status', async function(req,res) {
        elCtrl.license_status(req,res);
    });

    app.get('/shipment/:tradeId/prepare', async function(req,res) {
        shipCtrl.prepare_shipment(req,res);
    });

    app.get('/shipment/:tradeId/location', async function(req,res) {
        shipCtrl.shipment_location(req,res);
    });

    app.get('/shipment/:tradeId/bol', async function(req,res) {
        shipCtrl.shipment_bol(req,res);
    });
};
