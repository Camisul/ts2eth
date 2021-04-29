import { TypeInfo } from "./ts-compiler";

function join(args: any) {
  return (a: any) => !a ? args : join(args + a) 
}

function generateStructForIface(type_name: string, ti: TypeInfo[]) {
  const props = ti.reduce<string>((acc, cv) => acc + `  ${cv.internal_type.sol_name} ${cv.name};\n`, '');
  const src = join
  (`struct ${type_name} {\n`)
  (`${props}`)
  (`}`)
  ();
  console.log(src);
}
function generateDecoderForIface(type_name: string, ti: TypeInfo[]) {
  const props = ti.reduce<string>((acc, c, i) => acc + `    ${c.name}: LibRLPReader.read${c.internal_type.enc_name}(nodes[${i}]),\n`, '');
  const src = 
  `function decode${type_name}Data(bytes memeory dat) internal pure returns (${type_name} memory) {\n` +
  `  LibRLPReader.RLPItem[] memeory nodes = LibRLPReader.readList(dat);\n` +
  `  ${type_name} memory tmp = ${type_name}({\n` +
  props +
  `  });\n` +
  `  return tmp;\n` +
  `}\n`;
  console.log(src);
}
export function generate(type_name: string, mapping: TypeInfo[]) {
  generateStructForIface(type_name, mapping);
  generateDecoderForIface(type_name, mapping);
}