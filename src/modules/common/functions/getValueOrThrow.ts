import { NotPromise } from "../_";
import { isError } from "./isError";

export function getValueOrThrow<T>(maybeError: NotPromise<T> | Error) {
  if (isError(maybeError)) throw maybeError;

  return maybeError;
}
