'use strict';

const StatusCode = {
    FORBIDDEN: 403,
    CONFLIC: 409,
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLIC: 'Conflict error',
}

const {
    StatusCodes,
    ReasonPhrases
} = require('../utils/httpStatusCode')

class ErrorResponse extends  Error {

    constructor(status, message) {
        super(message)
        this.status = status
    }
}

class ConflicRequestError extends ErrorResponse {

    constructor(message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {

    constructor(message = ReasonStatusCode.CONFLIC, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {

    constructor( message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED ) {
        super(message, statusCode)
    }
}

module.exports = {
    ConflicRequestError,
    BadRequestError,
    AuthFailureError,
}