const statusMessage = {
  404: "Not found",
};

const newError = (status, message = statusMessage[status]) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = newError;
