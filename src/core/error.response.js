/** @format */

'use strict';

const { StatusCodes, ReasonPhrases } = require('../utils/HttpStatusCode');

class ErrorResponse extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;

	}
}

class ConflictRequestError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.CONFLICT,
		statusCode = StatusCodes.CONFLICT,
	) {
		super(message, statusCode);
	}
}

class BadRequestError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.BAD_REQUEST,
		statusCode = StatusCodes.BAD_REQUEST,
	) {
		super(message, statusCode);
	}
}
class AuthFailureError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.UNAUTHORIZED,
		statusCode = StatusCodes.UNAUTHORIZED,
	) {
		super(message, statusCode);
	}
}

class NotFoundError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.NOT_FOUND,
		statusCode = StatusCodes.NOT_FOUND,
	) {
		super(message, statusCode);
	}
}
class ForbiddenError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.FORBIDDEN,
		statusCode = StatusCodes.FORBIDDEN,
	) {
		super(message, statusCode);
	}
}
class NotAcceptableError extends ErrorResponse {
	constructor(
		message = ReasonPhrases.NOT_ACCEPTABLE,
		statusCode = StatusCodes.NOT_ACCEPTABLE,
	) {
		super(message, statusCode);
	}
}
class RequestTimeoutErro extends ErrorResponse {
	constructor(
		message = ReasonPhrases.REQUEST_TIMEOUT,
		statusCode = StatusCodes.REQUEST_TIMEOUT,
	) {
		super(message, statusCode);
	}
}

module.exports = {
	ConflictRequestError,
	BadRequestError,
	AuthFailureError,
	NotFoundError,
	ForbiddenError,
	NotAcceptableError,
	RequestTimeoutErro,
};
