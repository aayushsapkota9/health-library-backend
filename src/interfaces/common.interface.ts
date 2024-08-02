export enum SuccessMessage {
  CREATE = '%s created successfully.',
  FETCH = '%s fetched successfully',
  PATCH = '%s updated successfully',
  DELETE = '%s deleted successfully',
  REMOVE = '%s removed successfully',
  REGISTER = '%s registered successfully',
  ADMITTED = '%s admitted successfully',
  APPOINTMENT = '%s booked successfully',
  LOGGED_IN = 'logged in successfully',
  STORED = '%s stored successfully',
  PUBLISH = '%s published successfully',
  VERIFY = '%s verified successfully',
  REFRESH = '%s refreshed successfully',
  DEACTIVATE = '%s deactivated',
  ACTIVATE = '%s activated',
  SENT = '%s  sent',
  LOGIN = 'Login Successful',
}

export enum ErrorMessage {
  INVALID_BODY = 'Cannot process request body.',
  USERNAME_NOT_AVAILABLE = 'Username is not available.Choose another username.',
  NOT_AUTHORIZED = 'You are not authorized to access this resource.',
  NOT_AUTHENTICATED = 'You are not authenticated to access this resource.',
  INVALID_CREDENTIAL = 'invalid Email or Password',
  NOT_FOUND = '%s not found.',
  DUPLICATE_DATA = 'Duplicate %s found.',
  TOKEN_EXPIRED = 'Access Token has expired.',
  INVALID_TOKEN = 'Invalid Token',
  INVALID_OTP = 'Invalid OTP.',
  INTERNAL_SERVER_ERROR = 'Internal Server Error Something Went Wrong',
  PERMANENT_DATA = "You can't delete or update this %s.",
}

export enum ErrorStatusCode {
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}
