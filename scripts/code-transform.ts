import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import { type MagicString, type Statement, parseSync } from 'oxc-parser';
import { type Node, walk } from 'oxc-walker';

function sourceTextFromNode(
  context: { magicString?: MagicString },
  node: Node
): string {
  const magicString = context.magicString;
  assert(magicString, 'magicString should be defined');
  const start = node.start;
  const end = node.end;
  return magicString.getSourceText(start, end);
}

export async function rewriteObservableSubscribeToLastValueFrom(
  filename: string,
  content?: string
) {
  const code = content ?? (await fsp.readFile(filename, 'utf-8'));
  const parsedResult = parseSync('index.ts', code);
  const magicString = parsedResult.magicString;
  walk(parsedResult, {
    leave(node, _, context) {
      const transformExprs = <T extends Statement[]>(
        children: T
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
      ): T => {
        const newChildren: T = [] as any as T;
        for (const child of children) {
          if (
            child.type === 'ExpressionStatement' &&
            child.expression.type === 'CallExpression' &&
            child.expression.callee.type === 'StaticMemberExpression' &&
            child.expression.callee.property.name === 'subscribe' &&
            child.expression.arguments.length === 0
          ) {
            const newContent = `await lastValueFrom(${sourceTextFromNode(context, child.expression.callee.object)});`;

            const newStatements = parseSync('index.ts', newContent).program
              .body as any[];

            magicString.remove(child.start, child.end);
            magicString.appendRight(child.start, newContent);

            newChildren.push(...newStatements);
          } else if (
            child.type === 'ExpressionStatement' &&
            child.expression.type === 'CallExpression' &&
            child.expression.callee.type === 'StaticMemberExpression' &&
            child.expression.callee.property.name === 'subscribe' &&
            child.expression.arguments[0]?.type === 'ArrowFunctionExpression' &&
            child.expression.arguments[0].body.type === 'FunctionBody'
          ) {
            const awaited =
              child.expression.arguments[0].params.kind ===
                'ArrowFormalParameters' &&
              child.expression.arguments[0].params.items[0]?.type ===
                'FormalParameter' &&
              child.expression.arguments[0].params.items[0].pattern.type ===
                'Identifier'
                ? child.expression.arguments[0].params.items[0].pattern.name
                : undefined;
            const newContent =
              (awaited
                ? `const ${awaited} = await lastValueFrom(${sourceTextFromNode(
                    context,
                    child.expression.callee.object
                  )});\n`
                : `await lastValueFrom(${sourceTextFromNode(context, child.expression.callee.object)});\n`) +
              child.expression.arguments[0].body.statements
                .map((s) => sourceTextFromNode(context, s))
                .join(';\n');

            const newStatements = parseSync('index.ts', newContent).program
              .body as any[];

            magicString.remove(child.start, child.end);
            magicString.appendRight(child.start, newContent);

            newChildren.push(...newStatements);
          } else {
            newChildren.push(child as any);
          }
        }
        return newChildren;
      };
      if ('body' in node && Array.isArray(node.body) && node.body.length > 0) {
        const children = node.body;
        node.body = transformExprs(children as any)!;
      } else if (
        'body' in node &&
        node.body &&
        'type' in node.body &&
        node.body.type === 'FunctionBody'
      ) {
        const children = node.body.statements;
        node.body.statements = transformExprs(children)!;
      }
    },
  });

  const result = magicString.toString();

  return result;
}

export async function rewriteAllObservableSubscribeToLastValueFrom(
  pattern: string | string[]
) {
  const files = fsp.glob(pattern);
  for await (const file of files) {
    const result = await rewriteObservableSubscribeToLastValueFrom(file);

    await fsp.writeFile(file, result, 'utf-8');
  }
}
