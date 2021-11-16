const axios = require('axios');
const logger = require('logger');
const loggedInUserService = require('./LoggedInUserService');
const deserializer = require('serializers/deserializer');

class GeostoreService {

    static async getGeostore(geostoreId) {
        logger.info('Getting geostore with id', geostoreId);
        try {
            let baseURL = process.env.GEOSTORE_API_URL;
            const response = await axios.default({
                baseURL,
                url: `/geostore/${geostoreId}`,
                method: 'GET',
                headers: {
                    authorization: loggedInUserService.token
                }
            });
            const geostore = response.data;
            logger.info('Got geostore', geostore);
            return deserializer(geostore);
        } catch (e) {
            logger.error('Error while fetching geostore', e);
            throw e;
        }
    }

    static async createGeostore(geojson) {
        try {
            let baseURL = process.env.GEOSTORE_API_URL;
            const response = await axios.default({
                baseURL,
                url: `/geostore`,
                method: 'POST',
                headers: {
                    'authorization': loggedInUserService.token
                },
                data: {
                    geojson,
                    lock: true
                }
            });
            const geostore = response.data;
            return deserializer(geostore);
        } catch (e) {
            logger.error('Error while creating geostore', e);
            throw e;
        }
    }

}
module.exports = GeostoreService;
