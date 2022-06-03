const { Contact } = require("../../models/contacts");
const { newError } = require("../../additionals");

const getById = async (req, res) => {
  const { contactId } = req.params;

  const result = await Contact.findById(contactId);
  if (!result) {
    throw newError(404, "Not found");
  }
  res.json(result);
  console.log(req.params);
};

module.exports = getById;
