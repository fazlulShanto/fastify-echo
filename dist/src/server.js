"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const utils_1 = require("./utils");
dotenv_1.default.config();
//constants
const store = (0, utils_1.cacheDB)();
const PORT = process.env.PORT || 3400;
const fastify = (0, fastify_1.default)({
    logger: true,
});
fastify.register(cors_1.default, {
    origin: true,
});
// Declare a route
fastify.get("/", function (request, reply) {
    reply.send({
        message: "ok",
        availableRoutes: [
            "/health-check",
            "{RUD}/cache/:id",
            "/entries",
            "/cache",
        ],
    });
});
fastify.get("/health-check", function (request, reply) {
    reply.send({
        message: "ok",
        version: "1.0.0",
        totalCachedData: store.size(),
    });
});
fastify.delete("/cache/:id", function (request, reply) {
    const data = store.get(request.params.id);
    if (data) {
        store.delete(request.params.id);
        return reply.send({ message: "ok", data: data, id: request.params.id });
    }
    reply.status(404).send({ message: `No data exist with id ${request.params.id}.` });
});
fastify.get("/cache/:id", function (request, reply) {
    const itemId = request.params.id;
    const data = store.get((itemId));
    if (data) {
        return reply.send({ message: "ok", data: data });
    }
    reply.status(404).send({ message: `No data exist with id ${itemId}.` });
});
fastify.put("/cache/:id", function (request, reply) {
    const doesExist = store.has(request.params.id);
    if (doesExist) {
        const old = store.get(request.params.id);
        store.raw.set(request.params.id, request.body);
        return reply.send({ message: 'ok', old: old, new: request.body });
    }
    reply.status(404).send({ message: `No data exist with id ${request.params.id}.` });
});
fastify.post("/cache", function (request, reply) {
    const ttl = request.headers.ttl;
    if (ttl && Number(ttl) > 1) {
        const itemId = store.setWithCustomTTL(request.body, Number(ttl));
        reply.send({ message: "ok", data: request.body, id: itemId, customTTL: true });
    }
    else {
        const itemId = store.set(request.body);
        reply.send({ message: "ok", data: request.body, id: itemId });
    }
});
fastify.get("/entries", (req, reply) => {
    reply.send(store.entries());
});
// Run the server!
const start = async () => {
    try {
        console.clear();
        store.set("Initial data");
        await fastify.listen({ port: Number(PORT) });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
