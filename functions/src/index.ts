import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

admin.initializeApp(functions.config().firebase);

// RUN Firebase locally

// const firebaseKeys = require('./../nodejs-firebase-key');
// admin.initializeApp({
//   credential: admin.credential.cert({
//       projectId: firebaseKeys.project_id,
//       clientEmail: firebaseKeys.client_email,
//       privateKey: firebaseKeys.private_key
//   })
// });

const db = admin.firestore(); // Add this

app.use(function (req, res, next) {
  /*var err = new Error('Not Found');
   err.status = 404;
   next(err);*/

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});

app.post('/secrets', async (request, response) => {
    try {
      const { name, allowExport, text } = request.body;
      const data = {
        name,
        allowExport,
        text,
        createdAt:new Date().toString()
      }
      const secretRef = await db.collection('secrets').add(data);
      const refData = await secretRef.get();

      response.json({
        id: secretRef.id,
        ...refData.data()
      });

    } catch(error){

      response.status(500).send({serverError:error.message});

    }
  });

  app.get('/secrets/:id', async (request, response) => {
    try {
      const secretId = request.params.id;

      if (!secretId) throw new Error('Secret ID is required');

      const secret = await db.collection('secrets').doc(secretId).get();

      if (!secret.exists){
          throw new Error('Secret doesnt exist.')
      }

      response.json({
        id: secret.id,
        ...secret.data()
      });

    } catch(error){

      response.status(500).send({serverError:error.message});

    }
  });

  app.get('/secrets', async (request, response) => {
    try {

      const secretQuerySnapshot = await db.collection('secrets').get();
      const secrets: any[] = [];
      secretQuerySnapshot.forEach(
          (doc) => {
            secrets.push({
                  id: doc.id,
                  ...doc.data()
              });
          }
      );

      response.json(secrets);

    } catch(error){

      response.status(500).send({serverError:error.message});

    }

  });

  app.put('/secrets/:id', async (request, response) => {
    try {

      const secretId = request.params.id;
      const text = request.body.text;
      const name = request.body.name;

      if (!secretId) throw new Error('id is blank');

      if (!text) throw new Error('Text is required');

      if (!name) throw new Error('Name is required');

      const data = {
        text,name
      };

     await db.collection('secrets')
          .doc(secretId)
          .set(data, { merge: true });

      response.json({
          id: secretId,
          ...data
      })


    } catch(error){

      response.status(500).send({serverError:error.message});

    }

  });

  app.delete('/secrets/:id', async (request, response) => {
    try {

      const secretId = request.params.id;

      if (!secretId) throw new Error('id is blank');

      await db.collection('secrets')
          .doc(secretId)
          .delete();

      response.json({
          id: secretId,
      })


    } catch(error){

      response.status(500).send({serverError:error.message});
    }
  });

  app.get('/secretKey', async (request, response) => {
    try {

      response.json({
        secretKey: 'maor765',
      })

    } catch(error){
      response.status(500).send({serverError:error.message});
    }

  });
