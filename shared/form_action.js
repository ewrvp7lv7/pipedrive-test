'use server'

import logger from './logger';


const log = logger('Core ✨');

export async function handleSubmit2(event) {
    
    // const name1 = document.getElementById('name1').value;
    // const date1 = document.getElementById('date1').value;


    log.info('sendForm 2');

    //https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();

    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;


    console.log('process.env.PIPEDRIVE_API_KEY', process.env.PIPEDRIVE_API_KEY);

    async function updatingCustomFieldValue() {
      try {
        console.log('Sending request...');

        const DEAL_ID = 1; // An ID of Deal which will be updated
        const fieldsApi = new pipedrive.DealFieldsApi(defaultClient);
        const dealsApi = new pipedrive.DealsApi(defaultClient);

        // Get all Deal fields (keep in mind pagination)
        const dealFields = await fieldsApi.getDealFields();
        // Find a field you would like to set a new value to on a Deal
        const appointedManagerField = dealFields.data.find(field => field.name === 'name1');

        const updatedDeal = await dealsApi.updateDeal(DEAL_ID, {
          [appointedManagerField.key]: 'name5'
        });

        console.log('appointedManagerField key', appointedManagerField.key);

        // const api = new pipedrive.DealsApi(defaultClient);

        // const data = {
        //   text1: 'Deal of the century',
        // }
        // const response = await api.updateDeal(DEAL_ID, data);

        //https://github.com/pipedrive/client-nodejs/blob/master/docs/NotesApi.md#addNote



        console.log('The value of the custom field was updated successfully!', updatedDeal);
      } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Updating failed', errorToLog);
      }
    }

    updatingCustomFieldValue();


  };

export default handleSubmit2;
