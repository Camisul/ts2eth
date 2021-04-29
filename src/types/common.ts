import { Hash, bytes32, Uint, Address} from './';

export interface BlockHeader {
  number: Uint;
  hash: Hash;
  parentHash: Hash;
  nonce: Uint;
  sha3Uncles: Hash;
  logsBloom: string;
  transactionRoot: string;
  stateRoot: string;
  receiptRoot: string;
  miner: Address;
  extraData: string;
  gasLimit: Uint;
  gasUsed: Uint;
  timestamp: number | string;
}
