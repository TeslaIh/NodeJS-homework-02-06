const { newError } = require("../../additionals");
const { Contact } = require("../../models/contacts");

const deleteById = async (req, res) => {
  const { contactId } = req.params;
  const result = await Contact.findByIdAndRemove(contactId);
  if (!result) {
    throw newError(404, "Not found");
  }
  res.json({
    message: "contact deleted",
  });
};

module.exports = deleteById;
