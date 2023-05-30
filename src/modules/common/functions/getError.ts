import { NotPromise } from "../_";
import { isError } from "./isError";

export function getError<T>(error: NotPromise<T>) {
  if (isError(error)) return error;
  return new Error(error as string);
}
