/*
SPDX-License-Identifier: Apache-2.0
*/

var express = require('express');
var http = require('http');
var log4js = require('log4js');
var bodyParser = require('body-parser');
var cors = require('cors');
var expressJWT = require('express-jwt');

var app = express();

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST CONFIGURATION START HERE ///////////////////////
///////////////////////////////////////////////////////////////////////////////
var logger = log4js.getLogger('TradeExporterApp');

var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 4000;

app.options('*', cors());
app.use(cors());

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));

// set secret variable
app.set('secret', 'fabrichacker');
app.use(expressJWT({
    secret: 'fabrichacker'
}).unless({
    path: ['/login','/register']
}));

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
var routes = require('./routes/routes');
routes(app);

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function () { });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);

module.exports = server;
