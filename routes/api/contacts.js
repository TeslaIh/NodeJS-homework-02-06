const express = require("express");
const ctrl = require("../../controllers/contacts");
const ctrlWrapper = require("../../additionals/ctrlWrapper");
const { auth } = require("../../middlewares");

const router = express.Router();

router.get("/", auth, ctrl.getAll);
router.get("/:contactId", auth, ctrlWrapper(ctrl.getById));
router.post("/", auth, ctrlWrapper(ctrl.add));
router.delete("/:contactId", auth, ctrlWrapper(ctrl.removeById));
router.put("/:contactId", auth, ctrlWrapper(ctrl.putById));
router.patch("/:contactId/favorite", auth, ctrlWrapper(ctrl.patchFavById));

module.exports = router;
