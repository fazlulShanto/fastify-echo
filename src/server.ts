// imports
import dotenv from "dotenv";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { cacheDB } from "./utils";
dotenv.config();

//constants
const store = cacheDB();
const PORT = process.env.PORT || 3400;
const fastify = Fastify({
    logger: true,
});

// allow cors
type TFR = FastifyRequest<{ Params: { id: string } }>;

fastify.register(cors, {
    origin: true,
});

// Declare a route

fastify.get("/", function (request:TFR, reply:FastifyReply) {
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

fastify.get("/health-check", function (request: TFR, reply:FastifyReply) {
    reply.send({
        message: "ok",
        version: "1.0.0",
        totalCachedData: store.size(),
    });
});

fastify.delete("/cache/:id", function (request: TFR, reply:FastifyReply) {
    const data = store.get(request.params.id);
    if (data) {
        store.delete(request.params.id);
        return reply.send({ message: "ok",data : data, id : request.params.id });
    }
    reply.status(404).send({ message: `No data exist with id ${request.params.id}.` });
});

fastify.get("/cache/:id", function (request: TFR, reply:FastifyReply) {
    const itemId = request.params.id;
    const data = store.get((itemId));
    if (data ) {
        return reply.send({ message: "ok", data: data });
    }
    reply.status(404).send({ message: `No data exist with id ${itemId}.` });
});

fastify.put("/cache/:id", function (request: TFR, reply:FastifyReply) {
    const doesExist = store.has(request.params.id);
    if (doesExist) {
        const old = store.get(request.params.id)
        store.raw.set(request.params.id, request.body as any);
        return reply.send({message : 'ok',old :old, new : request.body});
    }
     reply.status(404).send({ message: `No data exist with id ${request.params.id}.` });
});

fastify.post("/cache", function (request:TFR, reply:FastifyReply) {
    const ttl = request.headers.ttl;
    if(ttl && Number(ttl) > 1){
        const itemId = store.setWithCustomTTL(request.body, Number(ttl));
        reply.send({ message: "ok", data: request.body, id: itemId ,customTTL : true});
    }else{
        const itemId = store.set(request.body);
        reply.send({ message: "ok", data: request.body, id: itemId });
    }
});

fastify.get("/entries", (req:TFR, reply:FastifyReply) => {
    reply.send(store.entries());
});

// Run the server!
const start = async () => {
    try {
        console.clear();
        store.set("Initial data");
        await fastify.listen({ port: Number(PORT) });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
