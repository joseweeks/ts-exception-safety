import { NotError } from "./NotError";
import { NotPromise } from "./NotPromise";

export type NotErrorOrPromise<T> = T extends NotError<T>
  ? T extends NotPromise<T>
    ? T
    : never
  : never;
