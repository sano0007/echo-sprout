import { httpRouter } from 'convex/server';
import { handleClerkWebhook } from '../handlers/clerk-webhook';
import { handleStripeWebhook } from '../handlers/stripe-webhook';

const http = httpRouter();

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

http.route({
  path: '/stripe-webhook',
  method: 'POST',
  handler: handleStripeWebhook,
});

export default http;
