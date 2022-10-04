const AreasService = require("./areas.service");
const AreaTemplateRelationService = require("./areaTemplateRelationService");

class TransformerService {
  static async transform() {
    // need to get all areas and create team and template relations for each of them.
    const areas = await AreasService.getEveryArea();
    areas.forEach(area => {
      if (area.reportTemplate) AreaTemplateRelationService.create({ areaId: area.id, templateId: area.reportTemplate });
      if (area.templateId) AreaTemplateRelationService.create({ areaId: area.id, templateId: area.templateId });
    });
  }
}
module.exports = TransformerService;
