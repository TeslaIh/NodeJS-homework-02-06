const statusMessage = {
  400: "Bad request",
  401: "Unauthorized",
  404: "Not found",
  409: "Conflict",
};

const newError = (status, message = statusMessage[status]) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = newError;
