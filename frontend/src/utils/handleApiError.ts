interface ApiError {
  response?: {
    data?: {
      msg?: string;
      message?: string;
    };
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  );
}

export function handleApiError(error: unknown) {
  if (isApiError(error)) {
    const msg =
      error.response?.data?.msg ||
      error.response?.data?.message;

    if (msg) return msg;
  }

  return "Something went wrong!";
}
