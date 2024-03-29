const AreaTemplateRelationModel = require("models/areaTemplateRelation.model");
const AreaTeamRelationModel = require("models/areaTeamRelation.model");
const { ObjectId } = require("mongoose").Types;
const { getTestServer } = require("./utils/test-server");
const { USERS } = require("./utils/test.constants");

const nock = require("nock");
const config = require("config");
const { mockGetUserFromToken, createAreaTemplateRelation, createAreaTeamRelation } = require("./utils/helpers");

const requester = getTestServer();

describe("Delete an area", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await AreaTemplateRelationModel.deleteMany({}).exec();
    await AreaTeamRelationModel.deleteMany({}).exec();
  });

  it('Delete area as an anonymous user should return an "Not logged" error with matching 401 HTTP code', async function () {
    const response = await requester.delete(`/v3/forest-watcher/area/1`).send();

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toHaveProperty("status", 401);
    expect(response.body.errors[0]).toHaveProperty("detail", "Unauthorized");
  });

  it("Delete area is successful if user created area", async function () {
    mockGetUserFromToken(USERS.USER);

    const areaId = new ObjectId();
    const otherAreaId = new ObjectId();
    const userId = USERS.USER.id;

    await createAreaTemplateRelation(areaId);
    await createAreaTemplateRelation(otherAreaId);
    let teamRelation = await createAreaTeamRelation(areaId, new ObjectId());
    await createAreaTeamRelation(otherAreaId, new ObjectId());

    let areaTeamRelations = await AreaTeamRelationModel.find({ areaId });
    let areaTemplateRelations = await AreaTemplateRelationModel.find({ areaId });

    expect(areaTeamRelations.length).toBe(1);
    expect(areaTemplateRelations.length).toBe(1);

    nock(config.get("rwAreasAPI.url"))
      .get(`/area/${areaId}`)
      .reply(200, {
        data: {
          type: "area",
          id: areaId,
          attributes: { userId }
        }
      });

    nock(config.get("rwAreasAPI.url"))
      .delete(`/area/${areaId}`)
      .reply(200, { data: { id: areaId } });

    nock(config.get("teamsAPI.url"))
      .get(`/teams/user/${USERS.USER.id}`)
      .reply(200, {
        data: [
          {
            id: teamRelation.teamId,
            attributes: {
              userRole: "monitor"
            }
          }
        ]
      });

    const response = await requester
      .delete(`/v3/forest-watcher/area/${areaId}`)
      .set("Authorization", `Bearer abcd`)
      .send();

    expect(response.status).toBe(204);

    let teamRelations = await AreaTeamRelationModel.find({});
    let templateRelations = await AreaTemplateRelationModel.find({});
    let emptyTeamRelations = await AreaTeamRelationModel.find({ areaId });
    let emptyTemplateRelations = await AreaTemplateRelationModel.find({ areaId });

    expect(teamRelations.length).toBe(1);
    expect(templateRelations.length).toBe(1);
    expect(emptyTeamRelations.length).toBe(0);
    expect(emptyTemplateRelations.length).toBe(0);
  });

  it("Delete area is unsuccessful if user didn't create area", async function () {
    mockGetUserFromToken(USERS.USER);

    const areaId = new ObjectId();
    const userId = new ObjectId();

    nock(config.get("rwAreasAPI.url"))
      .get(`/area/${areaId}`)
      .reply(200, {
        data: {
          type: "area",
          id: areaId,
          attributes: { userId }
        }
      });

    const response = await requester
      .delete(`/v3/forest-watcher/area/${areaId}`)
      .set("Authorization", `Bearer abcd`)
      .send();

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toHaveProperty("status", 401);
    expect(response.body.errors[0]).toHaveProperty("detail", "You are not authorised to delete this record");
  });

  afterEach(async function () {
    await AreaTemplateRelationModel.deleteMany({}).exec();
    await AreaTeamRelationModel.deleteMany({}).exec();
    nock.cleanAll();
  });
});
