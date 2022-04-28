const nock = require("nock");
const config = require("config");
const { AreaTemplateRelationModel } = require("models");
const { ObjectId } = require("mongoose").Types;

const mockGetUserFromToken = userProfile => {
  nock(config.get("controlTower.url"), { reqheaders: { authorization: "Bearer abcd" } })
    .get("/auth/user/me")
    .reply(200, userProfile);
};

const createRelation = async areaId => {
  let relation = new AreaTemplateRelationModel({ areaId, templateId: new ObjectId() });
  return await relation.save();
};

module.exports = {
  mockGetUserFromToken,
  createRelation
};
