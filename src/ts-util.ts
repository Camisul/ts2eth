
export function unsafe_cast<T>(a: any): T {
  return a as T;
}

export type Result<T> = [Error | null, T | null];
export function Ok<T>(a: T): Result<T> {
  return [null, a];
}

export function Err<T>(a: string): Result<T> {
  return [new Error(a), null];
}
