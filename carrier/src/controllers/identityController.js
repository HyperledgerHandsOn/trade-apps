/*
SPDX-License-Identifier: Apache-2.0
*/
"use strict";

const log4js = require('log4js');

const logger = log4js.getLogger('IdentityController');
const IdentityManager = require('../models/identityModel.js');

class IdentityController {
    constructor() {
        this.identityManager = new IdentityManager();
    }

    async init() {
        await this.identityManager.init();
    }

    async register(req, res) {
        try {
            const adminId = req.body.registrarUser;
            const adminPassword = req.body.registrarPassword;
            const enrollId = req.body.username;
            const enrollPassword = req.body.password;
            const enrollRole = req.body.role;
            if (!adminId || !adminPassword || !enrollId || !enrollPassword || !enrollRole) {
                res.status(500);
                res.send({ error:"Missing one or more parameters: (adminId, adminPassword, enrollId, enrollPassword, enrollRole)."});
            } else {
                this.identityManager.registerAndEnrollUser(
                    adminId, adminPassword,
                    enrollId, enrollPassword, enrollRole,
                    function (results, err) {
                        if (err) {
                            logger.error("Encountered an error creating user", err);
                            console.log(err);
                            res.status(500);
                            res.send({ error: err });
                        } else {
                            logger.info("User successfully created", results);
                            res.send(results);
                        }
                    });
            }
        } catch(err) {
            logger.error('Caught error', err);
            res.status(500);
            res.send({ error: err });
        }
    }


}

module.exports = IdentityController;