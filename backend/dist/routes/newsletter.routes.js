"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriber_controller_1 = require("../controllers/subscriber.controller");
const router = (0, express_1.Router)();
router.post("/subscribe", subscriber_controller_1.subscribeNewsletter);
exports.default = router;
//# sourceMappingURL=newsletter.routes.js.map