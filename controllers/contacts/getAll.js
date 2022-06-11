const { Contact } = require("../../models/contacts");
const { newError } = require("../../additionals");

const getById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;

  const result = await Contact.findOne({ _id: contactId, owner });
  if (!result) {
    throw newError(404, "Not found");
  }
  res.json(result);
};

module.exports = getById;
