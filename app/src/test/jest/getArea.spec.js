/* eslint-disable */
const chai = require("chai");
const nock = require("nock");
const { USERS } = require("./utils/test.constants");
const { ObjectId } = require("mongoose").Types;
const { getTestServer } = require("./utils/test-server");
const { mockGetUserFromToken } = require("./utils/helpers");
const config = require("config");
const AreaTeamRelationService = require("../../services/areaTeamRelationService");
const AreaTemplateRelationService = require("../../services/areaTemplateRelationService");
const { AreaTeamRelationModel } = require("models");

chai.should();

const requester = getTestServer();

describe("Get one area", function () {
    beforeAll(async function () {
        if (process.env.NODE_ENV !== "test") {
            throw Error(
                `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
            );
        }
        await AreaTeamRelationModel.deleteMany({})
    });

    it("Get an area without being logged in should return a 401 error", async function () {
        const response = await requester.get(`/v3/forest-watcher/area/1`);

        response.status.should.equal(401);
        response.body.should.have.property("errors").and.be.an("array");
        response.body.errors[0].should.have.property("detail").and.equal("Unauthorized");
    });


    it("Get area with supplied id should return that area", async function () {
        mockGetUserFromToken(USERS.USER);

        const areaId = new ObjectId()
        const areaId2 = new ObjectId()

        // teams

        const team1 = {
            id: new ObjectId(),
            attributes:
            {
                name: "team1",
                userRole: "manager"
            }
        }

        const team2 = {
            id: new ObjectId(),
            attributes: {
                name: "team2",
                userRole: "monitor"
            }
        }

        await AreaTeamRelationService.create({ areaId: areaId, teamId: team1.id })
        await AreaTeamRelationService.create({ areaId: areaId, teamId: new ObjectId() })

        nock(config.get("rwAreasAPI.url"))
            .get(`/area/${areaId}`)
            .reply(200, {
                data: {
                    type: "area",
                    id: areaId,
                }
            });

        nock(config.get("teamsAPI.url"))
            .get(`/teams/user/1a10d7c6e0a37126611fd7a5`)
            .reply(200, {
                data: [ team1, team2 ]
            }
            );

        // templates

        const template1 = {
            id: new ObjectId(),
        };
        const template2 = {
            id: new ObjectId(),
        };
        const template3 = {
            id: new ObjectId(),
        };

        await AreaTemplateRelationService.create({ areaId: areaId, templateId: template1.id })
        await AreaTemplateRelationService.create({ areaId: areaId, templateId: template2.id })
        await AreaTemplateRelationService.create({ areaId: areaId2, templateId: template2.id })
        await AreaTemplateRelationService.create({ areaId: areaId2, templateId: template3.id })

        nock(config.get("formsAPI.url"))
            .get(`/reports/${template1.id}`)
            .reply(200, {
                data: template1
            }
            );
            nock(config.get("formsAPI.url"))
            .get(`/reports/${template2.id}`)
            .reply(200, {
                data: template2
            }
            );
            nock(config.get("formsAPI.url"))
            .get(`/reports/${template3.id}`)
            .reply(200, {
                data: template3
            }
            );


        const response = await requester.get(`/v3/forest-watcher/area/${areaId}`).set("Authorization", `Bearer abcd`);

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty("data")
        expect(response.body.data).toHaveProperty("teams")
        expect(response.body.data.teams.length).toBe(1)
        expect(response.body.data.teams[0].id).toEqual(team1.id.toString())
        expect(response.body.data).toHaveProperty("reportTemplate")
        expect(response.body.data.reportTemplate.length).toBe(2)
        expect(response.body.data.reportTemplate[0].id).toEqual(template1.id.toString())
        expect(response.body.data.reportTemplate[1].id).toEqual(template2.id.toString())

    });

    afterEach(async function () {

        await AreaTeamRelationModel.deleteMany({}).exec();
        nock.cleanAll();

    });

});