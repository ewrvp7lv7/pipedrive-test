import { useRouter } from 'next/router';
import { useEffect, FormEvent } from 'react';

import io from 'socket.io-client';

import { useAppContext } from '../shared/context';
import logger from '../shared/logger';
import { initalizeSession } from '../shared/oauth';
import { getCustomUISDK } from '../shared/custom_ui_sdk';
import { handleSocketCommunication } from '../shared/socket';

import ContactList from '../components/ContactList';
import Dialer from '../components/Dialer';
import FollowUp from '../components/FollowUp';
import Login from '../components/Login';



// import { handleSubmit2 } from '../shared/form_action';

const apikey ="0fd72d15dcb6b7e16408f94eee047f0130dc773c";

const log = logger('Core ✨');


export const getServerSideProps = async ({ req, res, query }) => {
  log.info('Checking session details based on query parameters');
  const session = await initalizeSession(req, res, query.userId);
  return session.auth
    ? { props: { auth: true, session } }
    : { props: { auth: false } };
};

const Form1 = ({ auth, session }) => {
  const router = useRouter();
  const context = useAppContext();
  const socket = io();

  function handleSubmit(event) {
    event.preventDefault();
    const name1 = document.getElementById('name1').value;
    const date1 = document.getElementById('date1').value;

    // handleSubmit2(event);


    // log.info('sendForm 2');

    //https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api
    //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
    const pipedrive = require('pipedrive');
    const defaultClient = new pipedrive.ApiClient();

    // Configure authorization by settings api key
    // PIPEDRIVE_API_KEY is an environment variable that holds real api key
    // defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
    defaultClient.authentications.api_key.apiKey = apikey;



    async function updatingCustomFieldValue() {
      try {
        console.log('Sending request...');

        const DEAL_ID = 1; // An ID of Deal which will be updated
        const fieldsApi = new pipedrive.DealFieldsApi(defaultClient);
        const dealsApi = new pipedrive.DealsApi(defaultClient);

        // Get all Deal fields (keep in mind pagination)
        const dealFields = await fieldsApi.getDealFields();
        // Find a field you would like to set a new value to on a Deal
        const appointedManagerField = dealFields.data.find(field => field.name === 'job1');
        const appointedManagerField2 = dealFields.data.find(field => field.name === 'date1');

        const updatedDeal = await dealsApi.updateDeal(DEAL_ID, {
          [appointedManagerField.key]: name1,
          [appointedManagerField2.key]: date1
        });

        // console.log('appointedManagerField key', appointedManagerField.key);

        // https://github.com/pipedrive/client-nodejs/blob/master/docs/NotesApi.md#addNote
        // https://github.com/pipedrive/client-nodejs/blob/master/docs/AddNoteRequest.md

        let apiInstance = new pipedrive.NotesApi(defaultClient);
        let opts = pipedrive.AddNoteRequest.constructFromObject({
          // Properties that you want to update
          content:name1+" "+ date1,
          deal_id: DEAL_ID,
          // lead_id:0

        });
        apiInstance.addNote(opts).then((data) => {
          console.log('API called successfully. Returned data: ', data);
        }, (error) => {
          console.error("error", error);
        });




        // let apiInstance = new pipedrive.NoteFieldsApi(defaultClient);
        // apiInstance.getNoteFields().then((data) => {
        //   console.log('API called successfully. Returned data: ', data);
        //   console.log(JSON.stringify(data));
        // }, (error) => {
        //   console.error(error);
        // });

        // let apiInstance = new pipedrive.NotesApi(defaultClient);
        // let id = 0; // Number | The ID of the note
        // apiInstance.getNote(id).then((data) => {
        //   console.log('API called successfully. Returned data: ' + data);
        // }, (error) => {
        //   console.error(error);
        // });


        console.log('The value of the custom field was updated successfully!', updatedDeal);
      } catch (err) {
        const errorToLog = err.context?.body || err;

        console.log('Updating failed', errorToLog);
      }
    }

    updatingCustomFieldValue();


  };

  useEffect(() => {
    if (auth) {
      // Update the context variables once the session is initialized
      log.info('Setting user ID to ', router.query.userId);
      context.setUser(session);
      // Initialize Custom UI SDK and Socket communications
      (async () => {
        const sdk = await getCustomUISDK();
        await fetch('/api/socket', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        handleSocketCommunication(socket, context, sdk);
      })();
    }
  }, [router]);

  // Not logged-in? Login again
  if (auth === false) {
    return <Login />;
  }


  return (
    <div className="center-content">
      <form onSubmit={handleSubmit}>
        <div className="form-group mt-3">
          <label htmlFor="name1">Job title</label>
          <input
            className="form-control"
            id="name1"
            placeholder="Enter job title"
            autoComplete="off"
          />
          <small id="emailHelp" className="form-text text-muted">
            Enter job title, please
          </small>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="agent">Date</label>
          <input
            type="date"
            className="form-control"
            id="date1"
            placeholder="Enter date"
          />
        </div>
        <button className="mt-3 btn btn-primary" type="submit">
          Send
        </button>
      </form>
    </div>
  );

};

export default Form1;
