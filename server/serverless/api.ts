import * as awsServerlessExpress from 'aws-serverless-express';
import App from '../App';

const server = awsServerlessExpress.createServer(new App('/.netlify/functions/api').app);

export const handler = (event, context) => {
  awsServerlessExpress.proxy(server, event, context);
};
