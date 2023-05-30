export type NotPromise<T> = T extends Promise<unknown> ? never : T;
