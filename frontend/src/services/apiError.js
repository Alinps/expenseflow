export class ApiError extends Error {
    constructor({
        message,
        status = null,
        code = null,
        details = null,
        originalError = null,
    }) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.originalError = originalError;
    }
}

function extractValidationMessage(detail) {
    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                const location = Array.isArray(item.loc)
                    ? item.loc.filter((part) => part !== "body").join(".")
                    : "";

                const message = item.msg || "Invalid value";

                return location
                    ? `${location}: ${message}`
                    : message;
            })
            .join(", ");
    }

    return null;
}

export function normalizeApiError(error) {
    // Already normalized.
    if (error instanceof ApiError) {
        return error;
    }

    // Server responded with an HTTP error.
    if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        const detail = responseData?.detail;
        let message = extractValidationMessage(detail);

        if (!message && responseData?.message) {
            message = responseData.message;
        }

        if (!message) {
            const statusMessages = {
                400: "The request could not be processed.",
                401: "Authentication is required.",
                403: "You do not have permission to perform this action.",
                404: "The requested resource was not found.",
                409: "This operation conflicts with existing data.",
                422: "Please check the submitted information.",
                429: "Too many requests. Please try again later.",
                500: "An unexpected server error occurred.",
                502: "The server is temporarily unavailable.",
                503: "The service is currently unavailable.",
                504: "The server took too long to respond.",
            };

            message =
                statusMessages[status] ||
                "An unexpected API error occurred.";
        }

        return new ApiError({
            message,
            status,
            code: responseData?.code || null,
            details: detail || responseData || null,
            originalError: error,
        });
    }

    // Request was sent, but no response was received.
    if (error.request) {
        return new ApiError({
            message: "Unable to connect to the server. Check your internet connection.",
            code: "NETWORK_ERROR",
            originalError: error,
        });
    }

    // Something failed while setting up the request.
    return new ApiError({
        message: error.message || "An unexpected error occurred.",
        code: "REQUEST_ERROR",
        originalError: error,
    });
}