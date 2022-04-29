const logger = require("logger");
const Router = require("koa-router");
const AreasService = require("services/areas.service");
const GeoStoreService = require("services/geostore.service");
const CoverageService = require("services/coverage.service");
const TemplatesService = require("services/template.service");
const AreaValidator = require("validators/area.validator");
const moment = require("moment");
const config = require("config");
const AreaTemplateRelationService = require("services/areaTemplateRelationService").default;

const { AreaTemplateRelationModel } = require("models");

const ALERTS_SUPPORTED = config.get("alertsSupported");

const router = new Router({
  prefix: "/forest-watcher"
});

const globalAlerts = [
  {
    slug: "viirs",
    name: "VIIRS",
    active: false,
    startDate: "1",
    endDate: "8"
  }
];

class ForestWatcherFunctions {
  static async buildAreasResponse(areas = [], objects = {}) {
    const { geostoreObj, coverageObj } = objects;
    const areasWithGeostore = areas.filter(area => area.attributes.geostore);
    const promises = [
      Promise.all(
        areasWithGeostore.map(async area => {
          const templates = await AreaTemplateRelationService.getAllTemplatesForArea(area.id);
          return Promise.all(
            templates.map(async template => {
              try {
                return TemplatesService.getTemplate(template);
              } catch (error) {
                return null;
              }
            })
          );
        })
      )
    ];

    if (!geostoreObj) {
      promises.push(Promise.all(areasWithGeostore.map(area => GeoStoreService.getGeostore(area.attributes.geostore))));
    }
    if (!coverageObj) {
      promises.push(
        Promise.all(
          areasWithGeostore.map(area => {
            const params = {
              geostoreId: area.attributes.geostore,
              slugs: ALERTS_SUPPORTED
            };
            return CoverageService.getCoverage(params);
          })
        )
      );
    }
    try {
      const data = await Promise.all(promises);
      const [templatesData, geostoreData, coverageData] = data;

      return areasWithGeostore.map((area, index) => {
        const geostore = geostoreObj || geostoreData[index] || {};
        const reportTemplate = templatesData[index] || null;
        const coverage = coverageData[index] ? coverageData[index].layers : [];
        const datasets = ForestWatcherFunctions.getDatasetsWithCoverage(area.attributes.datasets, coverage);
        return {
          ...area,
          attributes: {
            ...area.attributes,
            geostore,
            datasets,
            coverage,
            reportTemplate
          }
        };
      });
    } catch (e) {
      logger.error("Error while fetching coverage, templates, geostore", e);
      throw e;
    }
  }

  static getUser(ctx) {
    return Object.assign(
      {},
      ctx.request.query.loggedUser ? JSON.parse(ctx.request.query.loggedUser) : {},
      ctx.request.body.loggedUser
    );
  }

  static getDatasetsWithActive(datasets = []) {
    if (!(datasets.length > 0) || datasets.find(d => d.active)) return datasets;

    datasets[0].active = true;
    return datasets;
  }

  static getDatasetsWithCoverage(list, layers = []) {
    const datasets = !list || list.length === 0 ? globalAlerts : list;
    logger.info("Parsing area datasets with datasets", datasets);
    logger.info("With coverage", layers);
    const glad = {
      slug: "umd_as_it_happens",
      name: "GLAD",
      active: false,
      startDate: 6,
      endDate: moment().format("YYYYMMDD")
    };

    const areaHasGlad = layers.includes(glad.slug);
    const datasetsHasGlad = datasets.find(dataset => dataset.slug === glad.slug);
    if (areaHasGlad && !datasetsHasGlad) {
      return ForestWatcherFunctions.getDatasetsWithActive([glad, ...datasets]);
    }
    return ForestWatcherFunctions.getDatasetsWithActive(datasets);
  }
}

class ForestWatcherRouter {
  static async getUserAreas(ctx) {
    const user = ForestWatcherFunctions.getUser(ctx);
    let data = [];
    if (user && user.id) {
      try {
        const areas = await AreasService.getUserAreas(user.id);
        try {
          data = await ForestWatcherFunctions.buildAreasResponse(areas);
        } catch (e) {
          ctx.throw(e.status, "Error while retrieving area's geostore, template, and coverage");
        }
      } catch (e) {
        ctx.throw(e.status, "Error while retrieving area");
      }
    }
    ctx.body = {
      data
    };
  }

  static async createArea(ctx) {
    const user = ForestWatcherFunctions.getUser(ctx);
    const { geojson, name } = ctx.request.body.fields || {};
    const { image } = ctx.request.body.files;
    let data = null;
    if (user && user.id) {
      try {
        const { area, geostore, coverage } = await AreasService.createAreaWithGeostore(
          {
            name,
            image
          },
          JSON.parse(geojson),
          user.id
        );
        logger.info("Created area", area, geostore, coverage);
        try {
          [data] = await ForestWatcherFunctions.buildAreasResponse([area], {
            geostore,
            coverage
          });
        } catch (e) {
          logger.error(e);
          ctx.throw(e.status, "Error while retrieving area's template");
        }
      } catch (e) {
        logger.error(e);
        ctx.throw(e.status, "Error while creating area");
      }
    }
    ctx.body = {
      data
    };
  }

  static async addTemplateRelation(ctx) {
    await AreaTemplateRelationService.create(ctx.params);
    ctx.status = 200;
  }

  static async deleteTemplateRelation(ctx) {
    await AreaTemplateRelationService.delete(ctx.params);
    ctx.status = 200;
  }

  static async deleteAllTemplateRelations(ctx) {
    if(!ctx.body.areaId && !ctx.body.templateId) {
      ctx.status = 400;
      throw new Error("Invalid request")
    }
    await AreaTemplateRelationService.deleteAll(ctx.body);
    ctx.status = 200;
  }

  static async addTeamRelation(ctx) {
    await AreaTemplateRelationService.create(ctx.params);
    ctx.status = 200;
  }

  static async deleteTeamRelation(ctx) {
    await AreaTemplateRelationService.delete(ctx.params);
    ctx.status = 200;
  }
}

const isAuthenticatedMiddleware = async (ctx, next) => {
  logger.info(`Verifying if user is authenticated`);
  const { query, body } = ctx.request;

  const user = {
    ...(query.loggedUser ? JSON.parse(query.loggedUser) : {}),
    ...body.loggedUser
  };

  if (!user || !user.id) {
    ctx.throw(401, "Unauthorized");
    return;
  }
  await next();
};

router.get("/area", isAuthenticatedMiddleware, ForestWatcherRouter.getUserAreas);
router.post("/area", isAuthenticatedMiddleware, AreaValidator.validateCreation, ForestWatcherRouter.createArea);
router.delete("/area/template", isAuthenticatedMiddleware, ForestWatcherRouter.deleteAllTemplateRelations);
router.post("/area/:areaId/template/:templateId", isAuthenticatedMiddleware, ForestWatcherRouter.addTemplateRelation);
router.delete(
  "/area/:areaId/template/:templateId",
  isAuthenticatedMiddleware,
  ForestWatcherRouter.deleteTemplateRelation
);
router.post("/area/:areaId/team/:teamId", isAuthenticatedMiddleware, ForestWatcherRouter.addTeamRelation);
router.delete(
  "/area/:areaId/team/:teamId",
  isAuthenticatedMiddleware,
  ForestWatcherRouter.deleteTeamRelation
);

router.get("/test", async ctx => {
  ctx.body = {
    relations: await AreaTemplateRelationModel.find()
  };
});

module.exports = router;
