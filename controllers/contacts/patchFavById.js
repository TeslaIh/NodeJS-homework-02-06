const { newError } = require("../../additionals");
const { Contact, schemas } = require("../../models/contacts");

const patchFavoriteById = async (req, res) => {
  const { error } = schemas.updateStatusContact.validate(req.body);
  if (error) {
    throw newError(400, "missing fields");
  }
  const { contactId } = req.params;
  const result = await Contact.findOneAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!result) {
    throw newError(404);
  }
  res.json(result);
};

module.exports = patchFavoriteById;
