//SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;
import "./lib/Lib_RLPReader.sol";

library Lib_iTestDecoder {
  struct iTest {
    bytes32 some_hash;
    uint some_uint;
    bytes32 some_bytes;
    address some_address;
  }

  function decodeiTestData(bytes memory dat) public pure returns (iTest memory) {
    Lib_RLPReader.RLPItem[] memory nodes = Lib_RLPReader.readList(dat);
    iTest memory tmp = iTest({
      some_hash: Lib_RLPReader.readBytes32(nodes[0]),
      some_uint: Lib_RLPReader.readUint256(nodes[1]),
      some_bytes: Lib_RLPReader.readBytes32(nodes[2]),
      some_address: Lib_RLPReader.readAddress(nodes[3])
    });
    return tmp;
  }
}