class HttpError extends Error {
  constructor(message, errorCode) {
    super(message) // calling the base class constructor
    this.code = errorCode
  }
}

module.exports = HttpError
