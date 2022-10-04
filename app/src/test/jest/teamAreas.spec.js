/* eslint-disable */
const nock = require("nock");
const chai = require("chai");
const { mockGetUserFromToken, createAreaTeamRelation } = require("./utils/helpers");
const { USERS } = require("./utils/test.constants");
const { getTestServer } = require("./utils/test-server");
const { ObjectId } = require("mongoose").Types;
const config = require("config");
const AreaTeamRelationModel = require("models/areaTeamRelation.model");

chai.should();

let requester;

describe("Get all areas for a given team", function () {
    beforeEach(async function () {
        if (process.env.NODE_ENV !== "test") {
            throw Error(
                `Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`
            );
        }

        requester = await getTestServer();

        await AreaTeamRelationModel.deleteMany({}).exec();
    });

     it('Get areas as an anonymous user should return an "Not logged" error with matching 401 HTTP code', async function () {
        const response = await requester.get(`/v3/forest-watcher/area/teamAreas/1`).send();

        response.status.should.equal(401);
        response.body.should.have.property("errors").and.be.an("array").and.length(1);
        response.body.errors[0].should.have.property("status").and.equal(401);
        response.body.errors[0].should.have.property("detail").and.equal("Unauthorized");
    });

    it('Get team areas should be unsuccessful and return a 404 if team doesnt exist', async function () {
        mockGetUserFromToken(USERS.USER);

        const teamId = new ObjectId();

        nock(config.get("teamsAPI.url"))
            .persist()
            .get(`/teams/${teamId}`)
            .reply(200,
                {data: null
            }
            );

        const response = await requester
            .get(`/v3/forest-watcher/area/teamAreas/${teamId}`)
            .set("Authorization", `Bearer abcd`)
            .send();

        response.status.should.equal(404);
        response.body.should.have.property("errors").and.be.an("array").and.length(1);
        response.body.errors[0].should.have.property("status").and.equal(404);
        response.body.errors[0].should.have.property("detail").and.equal("Team doesn't exist");
    });
 
    it("Get team areas should be successful and return an array of ids", async function () {
        mockGetUserFromToken(USERS.USER);

        // create a team id
        const teamId = new ObjectId();
        // create some areas
        const areaId1 = new ObjectId();
        const areaId2 = new ObjectId();
        const areaId3 = new ObjectId();
        // create the area-team relations
        createAreaTeamRelation(areaId1, teamId)
        createAreaTeamRelation(areaId2, teamId)
        createAreaTeamRelation(areaId3, new ObjectId())

        nock(config.get("teamsAPI.url"))
            .persist()
            .get(`/teams/${teamId}`)
            .reply(200, {data: 
                {
                    id: teamId,
                    attributes: {
                        teamId,
                        userId: USERS.USER.id,
                        role: "manager"
                    }
                }
            }
            );

        nock(config.get("rwAreasAPI.url"))
            .persist()
            .get(`/area/${areaId1}`)
            .reply(200,
                {data: {
                    id: areaId1,
                }
            }
            );

            nock(config.get("rwAreasAPI.url"))
            .persist()
            .get(`/area/${areaId2}`)
            .reply(200,
                {data:  {
                    id: areaId2,
                }
            }
            );

        const response = await requester
            .get(`/v3/forest-watcher/area/teamAreas/${teamId}`)
            .set("Authorization", `Bearer abcd`)
            .send();

        response.status.should.equal(200);
        expect(response.body).toHaveProperty("data")
        response.body.data.should.be.an("array").and.length(2);

        const area1 = response.body.data[0];
        const area2 = response.body.data[1];

        expect(area1).toEqual(areaId1.toString());
        expect(area2).toEqual(areaId2.toString());

    });

    afterEach(async function () {

        await AreaTeamRelationModel.deleteMany({}).exec();
        nock.cleanAll();

    });
});
