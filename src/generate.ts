import { writeFileSync } from "fs";
import { TypeInfo } from "./ts-compiler";
import { join } from 'path';

function generateStructForIface(type_name: string, ti: TypeInfo[]) {
  const props = ti.reduce<string>((acc, cv) => acc + `    ${cv.internal_type.sol_name} ${cv.name};\n`, '');
  const src = 
    `  struct ${type_name} {\n` +
    `${props}` +
    `  }\n`;
  return src;
}

function generateDecoderForIface(type_name: string, ti: TypeInfo[]) {
  const props = ti.reduce<string>((acc, c, i, arr) => 
    acc + `      ${c.name}: Lib_RLPReader.read${c.internal_type.enc_name}(nodes[${i}])${i == (arr.length - 1) ? '' : ','}\n`
    , '');
  const src =
    `  function decode${type_name}Data(bytes memory dat) public pure returns (${type_name} memory) {\n` +
    `    Lib_RLPReader.RLPItem[] memory nodes = Lib_RLPReader.readList(dat);\n` +
    `    ${type_name} memory tmp = ${type_name}({\n` +
    props +
    `    });\n` +
    `    return tmp;\n` +
    `  }\n`;
  return src;
}

let sources = '';
export function setSourcePath(path: string) {
  sources = path;
}

function preamble(type_name: string) {
  const src =
    `//SPDX-License-Identifier: MIT\n` +
    `pragma solidity >0.5.0 <0.8.0;\n` +
    `pragma experimental ABIEncoderV2;\n` +
    `import "./lib/Lib_RLPReader.sol";\n` +
    `\n` +
    `library Lib_${type_name}Decoder {\n`;
  return src;
}

function epilog() {
  return '}';
}

function write(type_name: string, source: string) {
  const path = join(sources, `Lib_${type_name}Decoder.sol`); 
  console.log('Writing to ', path);
  writeFileSync(path, source, {
    encoding: 'utf-8',
  });
}
export function generate(type_name: string, mapping: TypeInfo[]) {
  let full_source = preamble(type_name);
  full_source += generateStructForIface(type_name, mapping);
  full_source += '\n';
  full_source += generateDecoderForIface(type_name, mapping);
  full_source += epilog()
  console.log(full_source);
  write(type_name, full_source);
}