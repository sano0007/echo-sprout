import {httpRouter} from "convex/server";
import {handleClerkWebhook} from "../handlers/clerk-webhook";

const http = httpRouter();

http.route({
    path: "/clerk-users-webhook",
    method: "POST",
    handler: handleClerkWebhook,
});

export default http;
