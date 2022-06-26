const axios = require('axios');
const queryString = require('query-string');

const APIV3_URL = process.env.APIV3_URL;
const APIV3_USERNAME = process.env.APIV3_USERNAME;
const APIV3_PASSWORD = process.env.APIV3_PASSWORD;

/**
 * Launch Modules to Users
 * @param {Number} companyId
 * @param {Array} moduleIds
 * @param {Array} userEmails
 */
exports.launchModules = async (companyId, moduleIds, userEmails) => {
  const tokenResponse = await axios.request({
    method: 'GET', url: `${APIV3_URL}/Token`, headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: queryString.stringify({ username: APIV3_USERNAME, password: APIV3_PASSWORD, grant_type: 'password' }),
  });

  const TOKEN = tokenResponse.data.access_token;
  console.log({ companyId, moduleIds, userEmails });

  const launchResponse = await axios.request({
    method: 'POST', url: `${APIV3_URL}/api/mastero/ModuleLaunch`, headers: { Authorization: `Bearer ${TOKEN}` },
    data: { CompaneyId: companyId, ModuleId: moduleIds, UserEmail: userEmails, },
  });

  console.log({ data: launchResponse.data });
  return launchResponse;
};

/**
 * Pause Modules for Users
 * @param {Number} companyId
 * @param {Array} moduleIds
 * @param {Array} userEmails
 */
exports.pauseModules = async (companyId, moduleIds, userEmails) => {
  const tokenResponse = await axios.request({
    method: 'GET', url: `${APIV3_URL}/Token`, headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: queryString.stringify({ username: APIV3_USERNAME, password: APIV3_PASSWORD, grant_type: 'password' }),
  });

  const TOKEN = tokenResponse.data.access_token;

  const pauseResponse = await axios.request({
    method: 'POST', url: `${APIV3_URL}/api/mastero/ModuleDelete`, headers: { Authorization: `Bearer ${TOKEN}` },
    data: { CompaneyId: companyId, ModuleId: moduleIds, UserEmail: userEmails },
  });

  console.log({ data: pauseResponse.data });
  return pauseResponse;
};
