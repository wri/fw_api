const AreaTemplateRelationService = require("./areaTemplateRelationService");
const { AreaTemplateRelationModel } = require("models");
const { ObjectId } = require("mongoose").Types;
const { getTestServer } = require("../test/jest/utils/test-server");
const { createAreaTemplateRelation } = require("../test/jest/utils/helpers");
const { getAllTemplatesForArea } = require("./areaTemplateRelationService");

describe("Create relation using the areas template relation service", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await getTestServer();

    await AreaTemplateRelationModel.deleteMany({}).exec();
  });

  it("Calling Create should add a relation to the database and return the relation", async function () {
    const areaId = new ObjectId();
    const templateId = new ObjectId();

    let relation = await AreaTemplateRelationService.create({ areaId, templateId });
    let dbRelation = await AreaTemplateRelationModel.findOne();

    expect(relation).toHaveProperty("areaId", areaId.toString());
    expect(relation).toHaveProperty("templateId", templateId.toString());
    expect(dbRelation).toHaveProperty("areaId", areaId.toString());
    expect(dbRelation).toHaveProperty("templateId", templateId.toString());
  });

  it("Calling Create with an existing relation should return an error", async function () {
    const areaId = new ObjectId();
    const templateId = new ObjectId();

    let existingRelation = new AreaTemplateRelationModel({ areaId, templateId });
    await existingRelation.save();

    await expect(AreaTemplateRelationService.create({ areaId, templateId })).rejects.toThrowError(
      "This template is already assigned to this area"
    );
  });

  afterEach(async function () {
    await AreaTemplateRelationModel.deleteMany({}).exec();
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

    await AreaTemplateRelationModel.deleteMany({}).exec();
  });

  it("Returns an array of template ids given an area id", async function () {
    const areaId1 = new ObjectId(),
      areaId2 = new ObjectId();

    const relationOne = await createAreaTemplateRelation(areaId1);
    const relationTwo = await createAreaTemplateRelation(areaId1);
    await createAreaTemplateRelation(areaId2);

    const templates = await getAllTemplatesForArea(areaId1);

    expect(templates.length).toBe(2);
    expect(templates).toEqual(expect.arrayContaining([relationOne.templateId, relationTwo.templateId]));
  });

  afterEach(async function () {
    await AreaTemplateRelationModel.deleteMany({}).exec();
  });
});

describe("Delete a relation given area id and template id", function () {
  beforeEach(async function () {
    if (process.env.NODE_ENV !== "test") {
      throw Error(
        `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
      );
    }

    await getTestServer();

    await AreaTemplateRelationModel.deleteMany({}).exec();
  });

  it("Deletes a relation", async function () {
    const areaId1 = new ObjectId();

    await createAreaTemplateRelation(areaId1);
    const templates = await getAllTemplatesForArea(areaId1);

    expect(templates.length).toBe(1);

    await AreaTemplateRelationService.delete({ areaId: areaId1, templateId: templates[0] });
    const emptyTemplates = await getAllTemplatesForArea(areaId1);

    expect(emptyTemplates.length).toBe(0);
  });

  afterEach(async function () {
    await AreaTemplateRelationModel.deleteMany({}).exec();
  });
});
