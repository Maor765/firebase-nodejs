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
const db = admin.firestore(); // Add this

app.get('/warmup', (request, response) => {
    response.send('Warming up friend.');
})

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
      const fight = await secretRef.get();

      response.json({
        id: secretRef.id,
        ...fight.data()
      });

    } catch(error){

      response.status(500).send(error);

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

      response.status(500).send(error);

    }
  });

  app.get('/secrets', async (request, response) => {
    try {

      const fightQuerySnapshot = await db.collection('secrets').get();
      const secrets: any[] = [];
      fightQuerySnapshot.forEach(
          (doc) => {
            secrets.push({
                  id: doc.id,
                  ...doc.data()
              });
          }
      );

      response.json(secrets);

    } catch(error){

      response.status(500).send(error);

    }

  });

  app.put('/secrets/:id', async (request, response) => {
    try {

      const secretId = request.params.id;
      const text = request.body.text;

      if (!secretId) throw new Error('id is blank');

      if (!text) throw new Error('Text is required');

      const data = {
        text
      };

     await db.collection('secrets')
          .doc(secretId)
          .set(data, { merge: true });

      response.json({
          id: secretId,
          ...data
      })


    } catch(error){

      response.status(500).send(error);

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

      response.status(500).send(error);

    }

  });
