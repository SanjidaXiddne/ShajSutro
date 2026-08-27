"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("../controllers/contact.controller");
const router = (0, express_1.Router)();
router.post("/", contact_controller_1.createContactMessage);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map