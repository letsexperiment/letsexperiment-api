"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Session_1 = require("../controllers/Session");
class SessionRouter {
    constructor() {
        this.router = express_1.Router();
        this.controller = new Session_1.default();
        this.routes();
    }
    respond(res, r) {
        res.status(r.status).json(r);
    }
    routes() {
        this.router.route('/')
            .post(this.rootPost.bind(this));
        this.router.route('/:id')
            .get(this.idGet.bind(this))
            .put(this.idPut.bind(this));
    }
    rootGet(req, res) {
        this.controller.getAllSessions()
            .then((r) => this.respond(res, r))
            .catch((r) => this.respond(res, r));
    }
    rootPost(req, res) {
        this.controller.addSession(req.body)
            .then((r) => this.respond(res, r))
            .catch((r) => this.respond(res, r));
    }
    idGet(req, res) {
        this.controller.getSessionById(req.params.id)
            .then((r) => this.respond(res, r))
            .catch((r) => this.respond(res, r));
    }
    idPut(req, res) {
        this.controller.updateSessionById(req.params.id, req.body)
            .then((r) => this.respond(res, r))
            .catch((r) => this.respond(res, r));
    }
}
exports.default = SessionRouter;
