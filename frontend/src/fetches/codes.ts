import type { StatusCodes } from "http-status-codes";

export const Codes = {
    UNKNOWN_ERROR: 0,
    NOT_FOUND_ERROR: 1,
    REQUEST_VALIDATION_ERROR: 2,
    PYDANTIC_VALIDATION_ERROR: 3,
    DB_ERROR: 4,
    HTTP_ERROR: 5,
    BAD_VALUE: 6,
    INTEGRITY_ERROR: 7,
    INVALID_TOKEN: 8,
    INCORRECT_CREDENTIALS: 9,
    NO_ACCESS: 10,
    INVALID_OPERATION: 11,

    CHAT_ALREADY_EXISTS: 1001,
    CANNOT_CREATE_CHAT_WITH_YOURSELF: 1002

} as const;

export type Code = (typeof Codes)[keyof typeof Codes];

export type HttpStatusCode = (typeof StatusCodes)[keyof typeof StatusCodes];