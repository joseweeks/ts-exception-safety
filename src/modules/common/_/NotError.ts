export type NotError<T> = T extends Error ? never : T