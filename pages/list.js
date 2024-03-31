import { useRouter } from 'next/router';
import { useEffect } from 'react';
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

const log = logger('Core ✨');

export const getServerSideProps = async ({ req, res, query }) => {
  log.info('Checking session details based on query parameters');
  const session = await initalizeSession(req, res, query.userId);
  return session.auth
    ? { props: { auth: true, session } }
    : { props: { auth: false } };
};

const Home = ({ auth, session }) => {
  const router = useRouter();
  const context = useAppContext();
  const socket = io();

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


//   //https://developers.pipedrive.com/tutorials/update-custom-field-pipedrive-api
// //All tutorial Node.Js code examples are for reference only and shouldn't be used in production code as is. In production, a new new pipedrive.ApiClient() instance should be initialised separately for each request.
// const pipedrive = require('pipedrive');
// const defaultClient = new pipedrive.ApiClient();

// // Configure authorization by settings api key
// // PIPEDRIVE_API_KEY is an environment variable that holds real api key
// defaultClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
 
// async function updatingCustomFieldValue() {
//     try {
//         console.log('Sending request...');
        
//         const DEAL_ID = 1; // An ID of Deal which will be updated
//         const fieldsApi = new pipedrive.DealFieldsApi(defaultClient);
//         const dealsApi = new pipedrive.DealsApi(defaultClient);

//         // Get all Deal fields (keep in mind pagination)
//         const dealFields = await fieldsApi.getDealFields();
//         // Find a field you would like to set a new value to on a Deal
//         const appointedManagerField = dealFields.data.find(field => field.name === 'text1');

//         const updatedDeal = await dealsApi.updateDeal(DEAL_ID, {
//             [appointedManagerField.key]: 'Joker3'
//         });

//         console.log('appointedManagerField key', appointedManagerField.key);

//         // const api = new pipedrive.DealsApi(defaultClient);

//         // const data = {
//         //   text1: 'Deal of the century',
//         // }
//         // const response = await api.updateDeal(DEAL_ID, data);

//         //https://github.com/pipedrive/client-nodejs/blob/master/docs/NotesApi.md#addNote



//         console.log('The value of the custom field was updated successfully!', updatedDeal);
//     } catch (err) {
//         const errorToLog = err.context?.body || err;

//         console.log('Updating failed', errorToLog);
//     }
// }

// updatingCustomFieldValue();



  return (
    <div className="center-content">
      <h3>Hello</h3>
      <span>From panel</span>
    </div>
  );

};

export default Home;
