const nock = require("nock");
const chai = require("chai");
const chaiHttp = require("chai-http");
const config = require("config");

let requester;

chai.use(chaiHttp);

exports.getTestServer = function getTestServer() {
  if (requester) {
    return requester;
  }

  nock(config.get("controlTower.url")).post(`/api/v1/microservice`).reply(200);

  const server = require("../../../src/app");
  requester = chai.request(server).keepOpen();

  return requester;
};
