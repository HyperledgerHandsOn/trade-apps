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

describe('Basic Trading Scenario.', function () {
    this.timeout(60000);

 

    before(async () => {
    });

    it('basic app test.', async function () {

    });
});
