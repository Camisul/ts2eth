import { Hash, gen, Uint, bytes32, Address } from '../../../src/types';
interface iTest {
  some_hash: Hash
  some_uint: Uint
  some_bytes: bytes32
  some_address: Address
}

function doShit() {
  gen<iTest>();
  return;
}