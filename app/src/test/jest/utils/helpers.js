const nock = require("nock");
const config = require("config");
const { AreaTemplateRelationModel, AreaTeamRelationModel } = require("models");
const { ObjectId } = require("mongoose").Types;

const mockGetUserFromToken = userProfile => {
  nock(config.get("controlTower.url"), { reqheaders: { authorization: "Bearer abcd" } })
    .get("/auth/user/me")
    .reply(200, userProfile);
};

const createAreaTemplateRelation = async areaId => {
  let relation = new AreaTemplateRelationModel({ areaId, templateId: new ObjectId() });
  return await relation.save();
};

const createAreaTeamRelation = async (areaId, teamId) => {
  let relation = new AreaTeamRelationModel({ areaId, teamId });
  return await relation.save();
};

module.exports = {
  mockGetUserFromToken,
  createAreaTemplateRelation,
  createAreaTeamRelation
};
