const failureLimit = 300;
const unknownFailure = "Unknown failure";

type Described = { message: string; details?: string };

/**
 * The reason a reading stopped, whatever was thrown: an Error, a Supabase
 * error object (a plain record carrying message, details, hint and code,
 * never an Error) or anything else.
 */
export function describeReadingFailure(failure: unknown): string {
  return reasonOf(failure).slice(0, failureLimit);
}

function reasonOf(failure: unknown): string {
  if (failure instanceof Error) return failure.message || unknownFailure;
  if (!isDescribed(failure)) return unknownFailure;
  const details = failure.details ?? "";
  if (details === "") return failure.message;
  return `${failure.message} (${details})`;
}

function isDescribed(failure: unknown): failure is Described {
  if (typeof failure !== "object" || failure === null) return false;
  const message = (failure as { message?: unknown }).message;
  return typeof message === "string" && message !== "";
}
