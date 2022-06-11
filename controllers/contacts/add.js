const { newError } = require("../../additionals");
const { Contact, schemas } = require("../../models/contacts");

const add = async (req, res) => {
  const { _id } = req.user;
  const { error } = schemas.add.validate(req.body);
  if (error) {
    throw newError(400, "missing required name field");
  }
  const result = await Contact.create({ ...req.body, owner: _id });
  res.status(201).json(result);
};

module.exports = add;
