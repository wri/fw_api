const nock = require("nock");
const config = require("config");

const mockGetUserFromToken = userProfile => {
  nock(config.get("controlTower.url"), { reqheaders: { authorization: "Bearer abcd" } })
    .get("/auth/user/me")
    .reply(200, userProfile);
};

module.exports = {
  mockGetUserFromToken
};
