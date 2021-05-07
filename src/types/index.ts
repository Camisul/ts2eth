export interface Hash {};
export interface bytes32 {};
export interface Uint {};
export interface Address {};
export function gen<T>() {
  // Do absolutely nothing
  return;
}

type AnyDefined = Hash | bytes32 | Uint | Address;