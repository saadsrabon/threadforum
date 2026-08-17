type ValidationIssue = {
  path: (string | number)[];
  message: string;
};

export function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Request failed";
  }

  const payload = data as { error?: string; details?: ValidationIssue[] };

  if (payload.details?.length) {
    return payload.details
      .map((issue) => {
        const field = issue.path.length ? issue.path.join(".") : "input";
        return `${field}: ${issue.message}`;
      })
      .join(". ");
  }

  if (payload.error) {
    return payload.error;
  }

  return "Request failed";
}
