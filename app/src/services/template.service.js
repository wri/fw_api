const logger = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');
const deserializer = require('serializers/deserializer');
const axios = require("axios");
const loggedInUserService = require("./LoggedInUserService");

class TemplateService {

    static async getTemplate(templateId) {
        logger.info('Getting template with id', templateId);
        try {
            const baseURL = process.env.FORMS_API_URL;
            const response = await axios.default({
                baseURL,
                url: `/reports/${templateId}`,
                method: 'GET',
                headers: {
                    authorization: loggedInUserService.token
                }
            });
            const template = response.data;
            logger.info('Got template', template);
            return deserializer(template);
        } catch (e) {
            logger.error('Error while fetching template', e);
            throw e;
        }
    }

}
module.exports = TemplateService;
