import { assert } from 'console';
import * as ts from 'typescript';
import { Err, Ok, Result, unsafe_cast } from './ts-util';

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
  }

  interface InternalType {

  }
  interface TypeInfo {
    name: string,
    internal_type: InternalType,
  }

  function propsToMapping(props: ts.Symbol[]): Result<TypeInfo[]> {
    const res = [];

    for (const prop of props) {
      const decl = unsafe_cast<ts.PropertyDeclaration>(prop);
      if (!decl.type)
        return Err('No type to declare');
      const name = decl.name.getFullText().trim();
      const internal_type = declaredTypeToInternal(decl.type!);
      if (!internal_type)
        return Err('No internal type found');
      res.push({ name, internal_type: {} })
    }

    function declaredTypeToInternal(type_node: ts.TypeNode): InternalType {
      const type = checker.getTypeFromTypeNode(type_node);
      const symbol = type.aliasSymbol || type.getSymbol();
      if(!symbol || !symbol.declarations)
        return {}   
      return {};
    }
    return Ok(res);
  }
}
