import * as ts from 'typescript';
import { generate } from './generate';
import { Err, Ok, Raise, Result, unsafe_cast } from './ts-util';



export interface TypeInfo {
  name: string,
  internal_type: InternalType,
}

export interface InternalType {
  ts_name: string;
  sol_name: string;
  enc_name: string;
}


const DEFAULT_OPTS: ts.CompilerOptions = {};
export async function getDesiredTypesFromFile(filename: string) {
  const prog = ts.createProgram([filename], DEFAULT_OPTS);
  const checker = prog.getTypeChecker();

  prog.getSourceFiles().forEach(e => !e.isDeclarationFile && ts.forEachChild(e, visit))
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node))
      handleCallExpr(node);

    ts.forEachChild(node, visit);
  }

  function handleCallExpr(node: ts.CallExpression) {
    if (!node.typeArguments)
      return;

    const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
    const type_name = checker.typeToString(type);
    const props = checker.getPropertiesOfType(type);
    const [err, mapping] = propsToMapping(props);
    if (err) {
      console.error(err);
      return;
    }
    generate(type_name, mapping!);
    console.log({[type_name]: mapping});
  }

  interface SymbolObject {
    parent: any;
  }

  function propsToMapping(props: ts.Symbol[]): Result<TypeInfo[]> {
    const res = [];

    for (const prop of props) {
      const decl = unsafe_cast<ts.PropertyDeclaration>(prop.valueDeclaration);
      if (!decl.type)
        return Err('No type to declare');

      const name = decl.name.getFullText().trim();
      const [err, internal_type] = declaredTypeToInternal(decl.type!);
      if (err)
        return Raise(err);

      // Good job typescript thanks for forcing me to fix things that arent broken
      res.push({ name, internal_type: internal_type! })
    }

    function declaredTypeToInternal(type_node: ts.TypeNode): Result<InternalType> {

      // TODO: Make this accepnt not only `inteface` defined types but `type` defind types

      const type = checker.getTypeFromTypeNode(type_node);
      const symbol = type.aliasSymbol || type.getSymbol();
      if (!symbol || !symbol.declarations)
        return Err('No type/interface declaration for type ' + checker.typeToString(type));

      // Extracting parrent from the symbol identify `origin` of a type
      // if parrent is undefined then we are pretty shure that
      // the type in question was defind locally/in the same file
      //
      // Probably not a bad idea to get rid of it in favour of just checking 
      // the full file name in the first declaration
      const { parent } = unsafe_cast<SymbolObject>(symbol);

      const from_known_file = getKnownFiles().find(e => symbol.declarations[0].getSourceFile().fileName.endsWith(e));

      const type_str = checker.typeToString(type);

      if (!parent)
        return Err(`${type_str}: Complex types are not supported`);
      if (!from_known_file)
        return Err(`Depending on unknown file, currently not supported. Call \`generate\` in the file where interface \`${type_str}\` is defined`)

      const internal_type = getKnownTypes().find(e => e.ts_name == type_str);
      if (!internal_type)
        return Err('Unknown type: ' + type_str);

      return Ok(internal_type);
    }

    return Ok(res);
  }
  //exit(0);
}


function getKnownFiles(): Array<string> {
  return ['types/index.ts']
}

function getKnownTypes(): Array<InternalType> {
  return [{
    ts_name: 'Hash',
    sol_name: 'bytes32',
    enc_name: 'Bytes32',
  },
  {
    ts_name: 'bytes32',
    sol_name: 'bytes32',
    enc_name: 'Bytes32',
  },
  {
    ts_name: 'Address',
    sol_name: 'address',
    enc_name: 'Address',
  },
  {
    ts_name: 'Uint',
    sol_name: 'uint',
    enc_name: 'Uint256',
  }]
}
