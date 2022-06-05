const { newError } = require("../../additionals");
const { Contact, schemas } = require("../../models/contacts");

const putById = async (req, res) => {
  const { error } = schemas.add.validate(req.body);
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

module.exports = putById;
