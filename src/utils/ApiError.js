// API Error class for handling errors in a consistent way

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    stack_ = "",
    error = []
  ) {
    super(message);
    this.data = null;
    this.statusCode = statusCode;
    this.errors = error;
    this.success = false;

    if (stack_) {
      this.stack = stack_;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
