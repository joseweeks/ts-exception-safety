// Option 1:
// function isErrorObject(maybeError: unknown): maybeError is Error {
//   return maybeError instanceof Error;
// }

// Option 2 (benchmarks better):
export function isError(maybeError: unknown): maybeError is Error {
  return (
    maybeError !== null &&
    typeof maybeError === "object" &&
    "message" in maybeError &&
    "stack" in maybeError
  );
}
