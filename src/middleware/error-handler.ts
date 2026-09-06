import type { ErrorRequestHandler, RequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "API_ERROR",
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const getRequestId = (request: Parameters<ErrorRequestHandler>[1]): string =>
  request.get("x-request-id")?.trim() || "not-provided";

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${request.method} ${request.path} not found`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const requestId = getRequestId(request);
  const isHttpError = error instanceof HttpError;
  const isJsonSyntaxError = error instanceof SyntaxError && "body" in error;
  const statusCode = isHttpError ? error.statusCode : isJsonSyntaxError ? 400 : 500;
  const code = isHttpError ? error.code : isJsonSyntaxError ? "INVALID_JSON" : "INTERNAL_SERVER_ERROR";
  const message = isHttpError
    ? error.message
    : isJsonSyntaxError
      ? "Request body contains invalid JSON"
      : "Internal server error";

  if (statusCode >= 500) {
    console.error("Unhandled API error", { requestId, method: request.method, path: request.path, error });
  }

  response.status(statusCode).json({
    success: false,
    error: { code, message },
    meta: { requestId },
  });
};
