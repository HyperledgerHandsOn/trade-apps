/*
SPDX-License-Identifier: Apache-2.0
*/

const supertest = require('supertest');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

const CARRIER_URL='localhost:7000';
const REGULATOR_URL='localhost:6000';
const IMPORTER_URL='localhost:5000';
const EXPORTER_URL='localhost:4000';

async function register(request, admin, adminpw, user, userpw, role) {
    const res = await request
        .post('/register')
        .send('registrarUser=' + admin + '&registrarPassword='+adminpw+'&username='+user+'&password='+userpw+'&role='+role)
        .expect(200);
}

async function login(request, user, userpw) {
    const res = 
        await request
            .post('/login')
            .send('username='+user+'&password='+userpw)
            .expect(200);

    if (res.text) {
        return JSON.parse(res.text).token;
    } else {
        return res.body.token;
    }
}

describe('Basic Trading Scenario.', function () {
    this.timeout(60000);

    const importerRequest = supertest(IMPORTER_URL);
    const exporterRequest = supertest(EXPORTER_URL);
    const regulatorRequest = supertest(REGULATOR_URL);
    const carrierRequest = supertest(CARRIER_URL);
    var tokenImporter;
    var tokenExporter;
    var tokenRegulator;
    var tokenCarrier;
    var tokenExporterBanker;
    var tokenImporterBanker;

    const tradeId=new Date().valueOf();
    const elId='el'+tradeId;
    const exporterMSP='ExporterOrgMSP';
    const importerMSP='ImporterOrgMSP';
    const carrierMSP='CarrierOrgMSP';
    const amount=50;
    const descriptionOfGoods='Some old computers';

    const letterOfCreditId=new Date().valueOf();
    const requiredDocs='B/L,E/L';
    const expiryDate='12/31/2040';

    const sourcePort='London';
    const destinationPort='Tokyo';

    before(async () => {
        await register(importerRequest, 'admin', 'adminpw', 'importer', 'importerpw', 'client');
        await register(importerRequest, 'admin', 'adminpw', 'importerBanker', 'bankerpw', 'banker');
        await register(exporterRequest, 'admin', 'adminpw', 'exporter', 'exporterpw', 'client'); 
        await register(exporterRequest, 'admin', 'adminpw', 'exporterBanker', 'bankerpw', 'banker');
        await register(regulatorRequest, 'admin', 'adminpw', 'regulator', 'regulatorpw', 'client'); 
        await register(carrierRequest, 'admin', 'adminpw', 'carrier', 'carrierpw', 'client'); 

        tokenImporter = await login(importerRequest, 'importer', 'importerpw');
        tokenImporterBanker = await login(importerRequest, 'importerBanker', 'bankerpw');
        tokenExporter = await login(exporterRequest, 'exporter', 'exporterpw');
        tokenExporterBanker = await login(exporterRequest, 'exporterBanker', 'bankerpw');
        tokenRegulator = await login(regulatorRequest, 'regulator', 'regulatorpw');
        tokenCarrier = await login(carrierRequest, 'carrier', 'carrierpw');
    });

    it('importer can create a trade and the exporter can see it.', async function () {
        const newTradeRes = await importerRequest
            .post('/requestTrade')
            .set('authorization', 'Bearer ' + tokenImporter)
            .send(`tradeId=${tradeId}&exporterMSP=${exporterMSP}&amount=${amount}&descriptionOfGoods=${descriptionOfGoods}`)
            .expect(200);

        const tradeLookupRes = await exporterRequest
            .get(`/trade/${tradeId}`)
            .set('authorization', 'Bearer ' + tokenExporter)
            .expect(200);
    });
        
    it('exporter can accept a trade.', async function () {
        const tradeAcceptRes1 = await exporterRequest
            .get(`/trade/${tradeId}/accept_trade`)
            .set('authorization', 'Bearer ' + tokenExporter)
            .expect(200);
    });

    it('importer can request a letter of credit.', async function () {
        const reqLCRes = await importerRequest
            .post(`/requestLC`)
            .set('authorization', 'Bearer ' + tokenImporter)
            .send(`tradeId=${tradeId}`)
            .expect(200);
    });

    it('bank can issue a letter of credit.', async function () {
        const issueLCRes = await importerRequest
            .post(`/issueLC`)
            .set('authorization', 'Bearer ' + tokenImporterBanker)
            .send(`tradeId=${tradeId}&lcId=${letterOfCreditId}&expirationDate=${expiryDate}&requiredDocs=${requiredDocs}`)
            .expect(200);
    });

    it('exporter\'s bank can retrieve and accept a letter of credit.', async function () {
        const lcRes = await exporterRequest
            .get(`/loc/${tradeId}`)
            .set('authorization', 'Bearer ' + tokenExporterBanker)
            .expect(200);
        lcRes.body.id.should.equal(tradeId.toString());

        await exporterRequest
            .get(`/loc/${tradeId}/accept_letter`)
            .set('authorization', 'Bearer ' + tokenExporterBanker)
            .expect(200);
    });

    it('exporter\'s request an export license and the regulator can see it.', async function () {
        await exporterRequest
            .get(`/el/${tradeId}/request`)
            .set('authorization', 'Bearer ' + tokenExporter)
            .expect(200);

        const elRes = await regulatorRequest
            .get(`/getEL?tradeId=${tradeId}`)
            .set('authorization', 'Bearer ' + tokenRegulator)
            .expect(200);
        elRes.text.indexOf("REQUESTED").should.not.equal(-1);
    });

    it('regulator issues an export license and the exporter can retrieve it.', async function () {
        await regulatorRequest
            .post(`/issueEL`)
            .set('authorization', 'Bearer ' + tokenRegulator)
            .send(`tradeId=${tradeId}&&elId=${elId}&&expirationDate=${expiryDate}`)
            .expect(200);

        const elRes = await exporterRequest
            .get(`/el/${tradeId}`)
            .set('authorization', 'Bearer ' + tokenExporter)
            .expect(200);
        elRes.text.indexOf("ISSUED").should.not.equal(-1);
        elRes.body.id.should.equal("el"+tradeId.toString());
    });

    it('exporter prepare shipment and carrier can accept it.', async function() {
        const prepRes = await exporterRequest
            .get(`/shipment/${tradeId}/prepare`)
            .set('authorization', 'Bearer ' + tokenExporter)
            .send(`carrierMSP=${carrierMSP}&&descriptionOfGoods=${descriptionOfGoods}&&amount=${amount}&&beneficiary=${importerMSP}`)
            .expect(200);

        const bolRes = await carrierRequest
            .get(`/shipment/${tradeId}/accept_and_issue_bill`)
            .set('authorization', 'Bearer ' + tokenCarrier)
            .send(`blId=bl${tradeId}&&expirationDate=${expiryDate}&&sourcePort=${sourcePort}&&destinationPort=${destinationPort}`)
            .expect(200);
    });
});
