const AreaTeamRelationService = require("./areaTeamRelationService");
const { AreaTeamRelationModel } = require("models");
const { ObjectId } = require("mongoose").Types;
const { getTestServer } = require("../test/jest/utils/test-server");
const { createAreaTeamRelation } = require("../test/jest/utils/helpers");
const { getAllTeamsForArea } = require("./areaTeamRelationService");

describe("Create relation using the areas team relation service", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await getTestServer();

    await AreaTeamRelationModel.deleteMany({}).exec();
  });

  it("Calling Create should add a relation to the database and return the relation", async function () {
    const areaId = new ObjectId();
    const teamId = new ObjectId();

    let relation = await AreaTeamRelationService.create({ areaId, teamId });
    let dbRelation = await AreaTeamRelationModel.findOne();

    expect(relation).toHaveProperty("areaId", areaId.toString());
    expect(relation).toHaveProperty("teamId", teamId.toString());
    expect(dbRelation).toHaveProperty("areaId", areaId.toString());
    expect(dbRelation).toHaveProperty("teamId", teamId.toString());
  });

  it("Calling Create with an existing relation should return an error", async function () {
    const areaId = new ObjectId();
    const teamId = new ObjectId();

    let existingRelation = new AreaTeamRelationModel({ areaId, teamId });
    await existingRelation.save();

    await expect(AreaTeamRelationService.create({ areaId, teamId })).rejects.toThrowError(
      "This team is already assigned to this area"
    );
  });

  afterEach(async function () {
    await AreaTeamRelationModel.deleteMany({}).exec();
  });
});

describe("Get all relations given an area id", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await getTestServer();

    await AreaTeamRelationModel.deleteMany({}).exec();
  });

  it("Returns an array of team ids given an area id", async function () {
    const areaId1 = new ObjectId(),
      areaId2 = new ObjectId();

    const relationOne = await createAreaTeamRelation(areaId1, new ObjectId());
    const relationTwo = await createAreaTeamRelation(areaId1, new ObjectId());
    await createAreaTeamRelation(areaId2, new ObjectId());

    const teams = await getAllTeamsForArea(areaId1);

    expect(teams.length).toBe(2);
    expect(teams).toEqual(expect.arrayContaining([relationOne.teamId, relationTwo.teamId]));
  });

  afterEach(async function () {
    await AreaTeamRelationModel.deleteMany({}).exec();
  });
});

describe("Delete a relation given area id and team id", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await getTestServer();

    await AreaTeamRelationModel.deleteMany({}).exec();
  });

  it("Deletes a relation", async function () {
    const areaId1 = new ObjectId();

    await createAreaTeamRelation(areaId1, new ObjectId());
    const teams = await getAllTeamsForArea(areaId1);

    expect(teams.length).toBe(1);

    await AreaTeamRelationService.delete({ areaId: areaId1, teamId: teams[0] });
    const emptyTeams = await getAllTeamsForArea(areaId1);

    expect(emptyTeams.length).toBe(0);
  });

  afterEach(async function () {
    await AreaTeamRelationModel.deleteMany({}).exec();
  });
});
