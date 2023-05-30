import Benchmark from "benchmark";

import { NotErrorOrPromise } from "../modules/common/_";

type ErrorableSuccess<T extends NotErrorOrPromise<unknown>> = {
  isError: false;
  value: T;
};
type ErrorableError = { isError: true; error: Error };
type Errorable<T extends NotErrorOrPromise<unknown>> =
  | ErrorableSuccess<T>
  | ErrorableError;

function isError(maybeError: unknown): maybeError is Error {
  return (
    maybeError !== null &&
    typeof maybeError === "object" &&
    "message" in maybeError &&
    "stack" in maybeError
  );
}

function isErrorableError<T>(
  errorable: Errorable<T>
): errorable is ErrorableError {
  return errorable.isError;
}

function makeSuccess<T>(value: NotErrorOrPromise<T>): ErrorableSuccess<T> {
  return { isError: false, value } as const;
}

function makeError(error: unknown): ErrorableError {
  if (error instanceof Error) return { isError: true, error };
  return { isError: true, error: new Error(error as string) };
}

function getNumberWithException(index: number, errorModulo: number) {
  if (index % errorModulo === 0) throw new Error(`Found at ${index}`);
  return index;
}

function getNumber(index: number, errorModulo: number) {
  if (index % errorModulo === 0) return makeError(`Found at ${index}`);

  return makeSuccess(index);
}

function getNumberWithError(index: number, errorModulo: number) {
  if (index % errorModulo === 0) return new Error(`Found at ${index}`);

  return index;
}

function simpleLoopWithException(iterations: number, errorModulo: number) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    try {
      successes.push(getNumberWithException(i, errorModulo));
    } catch (err) {
      errors.push(err);
    }
  }
}

function simpleLoop(iterations: number, errorModulo: number) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = getNumber(i, errorModulo);
    if (isErrorableError(result)) {
      errors.push(result.error);
    } else {
      successes.push(result.value);
    }
  }
}

function simpleLoopWithError(iterations: number, errorModulo: number) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = getNumberWithError(i, errorModulo);
    if (isError(result)) {
      errors.push(result);
    } else {
      successes.push(result);
    }
  }
}

function deepLoopWithException_Recursive(
  index: number,
  errorModulo: number,
  depth: number
): number {
  if (depth === 0) return getNumberWithException(index, errorModulo);
  return deepLoopWithException_Recursive(index, errorModulo, depth - 1);
}

function deepLoopWithException(
  iterations: number,
  errorModulo: number,
  depth: number
) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    try {
      successes.push(deepLoopWithException_Recursive(i, errorModulo, depth));
    } catch (err) {
      errors.push(err);
    }
  }
}

function deepLoop_Recursive(
  index: number,
  errorModulo: number,
  depth: number
): ReturnType<typeof getNumber> {
  if (depth === 0) return getNumber(index, errorModulo);
  return deepLoop_Recursive(index, errorModulo, depth - 1);
}

function deepLoop(iterations: number, errorModulo: number, depth: number) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = deepLoop_Recursive(i, errorModulo, depth);
    if (isErrorableError(result)) {
      errors.push(result.error);
    } else {
      successes.push(result.value);
    }
  }
}

function deepLoopWithError_Recursive(
  index: number,
  errorModulo: number,
  depth: number
): ReturnType<typeof getNumberWithError> {
  if (depth === 0) return getNumberWithError(index, errorModulo);
  return deepLoopWithError_Recursive(index, errorModulo, depth - 1);
}

function deepLoopWithError(
  iterations: number,
  errorModulo: number,
  depth: number
) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = deepLoopWithError_Recursive(i, errorModulo, depth);
    if (isError(result)) {
      errors.push(result);
    } else {
      successes.push(result);
    }
  }
}

function deepLoopWithBranch_Recursive(
  index: number,
  errorModulo: number,
  depth: number
): ReturnType<typeof getNumber> {
  if (depth === 0) return getNumber(index, errorModulo);
  const result = deepLoopWithBranch_Recursive(index, errorModulo, depth - 1);
  if (isErrorableError(result)) return result;
  return result;
}
function deepLoopWithBranch(
  iterations: number,
  errorModulo: number,
  depth: number
) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = deepLoopWithBranch_Recursive(i, errorModulo, depth);
    if (isErrorableError(result)) {
      errors.push(result.error);
    } else {
      successes.push(result.value);
    }
  }
}

function deepLoopWithBranchAndError_Recursive(
  index: number,
  errorModulo: number,
  depth: number
): ReturnType<typeof getNumberWithError> {
  if (depth === 0) return getNumberWithError(index, errorModulo);
  const result = deepLoopWithBranchAndError_Recursive(
    index,
    errorModulo,
    depth - 1
  );
  if (isError(result)) return result;
  return result;
}
function deepLoopWithBranchAndError(
  iterations: number,
  errorModulo: number,
  depth: number
) {
  const successes = [];
  const errors = [];
  for (let i = 0; i < iterations; ++i) {
    const result = deepLoopWithBranchAndError_Recursive(i, errorModulo, depth);
    if (isError(result)) {
      errors.push(result);
    } else {
      successes.push(result);
    }
  }
}

const suite = new Benchmark.Suite();

for (const [iterations, errorModulo] of [
  [1000, 0],
  [1000, 100],
  [1000, 1],
  [100000, 0],
  [100000, 100],
  [100000, 1],
]) {
  suite.add(`simpleLoopWithException-${iterations},${errorModulo}`, () =>
    simpleLoopWithException(iterations, errorModulo)
  );
  suite.add(`simpleLoop             -${iterations},${errorModulo}`, () =>
    simpleLoop(iterations, errorModulo)
  );
  suite.add(`simpleLoopWithError    -${iterations},${errorModulo}`, () =>
    simpleLoopWithError(iterations, errorModulo)
  );
  suite.add(`deepLoopWithException  -${iterations},${errorModulo}`, () =>
    deepLoopWithException(iterations, errorModulo, 20)
  );
  suite.add(`deepLoop               -${iterations},${errorModulo}`, () =>
    deepLoop(iterations, errorModulo, 20)
  );
  suite.add(`deepLoopWithError      -${iterations},${errorModulo}`, () =>
    deepLoopWithError(iterations, errorModulo, 20)
  );
  suite.add(`deepLoopWithBranch     -${iterations},${errorModulo}`, () =>
    deepLoopWithBranch(iterations, errorModulo, 20)
  );
  suite.add(`deepLoopWithBranchAE   -${iterations},${errorModulo}`, () =>
    deepLoopWithBranchAndError(iterations, errorModulo, 20)
  );
}

suite
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .on("cycle", (event: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(String(event.target));
  })
  // run async
  .run({ async: true });
