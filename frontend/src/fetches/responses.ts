import { Codes, type Code } from "./codes";

export interface AppResponse {
    ok: boolean,
    status?: number,
    message?: string,
    data?: AppResponseData | AppResponseErrorData
}

export interface AppResponseData { }

export interface OkResponseData extends AppResponseData {
    ok: boolean
}

//// Error data

export interface AppResponseErrorData {
    error: AppResponseError
}

// Specifies the details which should be used for error codes
type ErrorDetailsMap = {
    [Codes.PYDANTIC_VALIDATION_ERROR]: ValidationErrorDetails;
    [Codes.REQUEST_VALIDATION_ERROR]: RequestValidationErrorDetails;
    [Codes.INTEGRITY_ERROR]: IntegrityErrorDetails;
    [Codes.NOT_FOUND_ERROR]: NotFoundErrorDetails;
};

type KnownErrorCode = keyof ErrorDetailsMap;

type KnownAppResponseError = {
    [K in KnownErrorCode]: {
        code: K;
        message: string;
        details: ErrorDetailsMap[K];
    };
}[KnownErrorCode];

type UnknownAppResponseError = {
    code: Exclude<Code, KnownErrorCode>;
    message: string;
    details: CommonResponseErrorDetails;
};

export type AppResponseError = KnownAppResponseError | UnknownAppResponseError;

//// Error details

export interface CommonResponseErrorDetails {
    msg: string
}

export interface RequestValidationErrorDetails {
    errors: Array<unknown>
}

export interface ValidationErrorDetails {
    errors: Array<ValidationErrorDetail>
}

interface ValidationErrorDetail {
    type: string;

    /**
     * Path in the data structure where the error occurred.
     * Can contain strings and/or numbers.
     */
    loc: Array<string | number>;

    /**
     * Human-readable error message.
     */
    msg: string;

    /**
     * The original input that triggered the error.
     */
    input: unknown;

    /**
     * Optional additional context related to the error.
     */
    ctx?: Record<string, unknown>;
}

export interface IntegrityErrorDetails {
    entity: string,
    is_uniqueness: boolean
}

export interface NotFoundErrorDetails {
    entity: string
    entity_id: number
}