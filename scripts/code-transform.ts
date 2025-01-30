import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import {
  type ArrowFunctionExpression,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
  type Function,
  type MagicString,
  type Statement,
  parseSync,
} from 'oxc-parser';
import { walk } from 'oxc-walker';

function sourceTextFromNode(
  context: { magicString?: MagicString },
  node: { start: number; end: number }
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
            child.expression.callee.property.name === 'subscribe'
          ) {
            let next: ArrowFunctionExpression | Function | undefined;
            let error: ArrowFunctionExpression | Function | undefined;
            let complete: ArrowFunctionExpression | Function | undefined;

            if (child.expression.arguments[0]?.type === 'ObjectExpression') {
              const obj = child.expression.arguments[0];
              for (const prop of obj.properties) {
                if (
                  prop.type === 'ObjectProperty' &&
                  prop.key.type === 'Identifier' &&
                  (prop.value.type === 'FunctionExpression' ||
                    prop.value.type === 'ArrowFunctionExpression')
                ) {
                  if (prop.key.name === 'next') {
                    next = prop.value;
                  } else if (prop.key.name === 'error') {
                    error = prop.value;
                  } else if (prop.key.name === 'complete') {
                    complete = prop.value;
                  }
                }
              }
            } else if (
              child.expression.arguments.find(
                (arg) =>
                  arg.type === 'FunctionExpression' ||
                  arg.type === 'ArrowFunctionExpression'
              )
            ) {
              const args: Array<
                Function | ArrowFunctionExpression | undefined
              > = child.expression.arguments.map((arg) =>
                arg.type === 'FunctionExpression' ||
                arg.type === 'ArrowFunctionExpression'
                  ? arg
                  : undefined
              );
              next = args[0];
              error = args[1];
              complete = args[2];
            }
            let newContent = `await lastValueFrom(${sourceTextFromNode(context, child.expression.callee.object)});`;

            if (next) {
              const nextParam =
                next?.params?.items?.[0]?.type === 'FormalParameter'
                  ? sourceTextFromNode(context, next.params.items[0])
                  : undefined;

              if (nextParam) {
                newContent = `const ${nextParam} = ${newContent}`;
              }
              newContent += (next.body?.statements || [])
                .map((s) => sourceTextFromNode(context, s))
                .join('\n');
            }

            if (error || complete) {
              const errorParam =
                error?.params?.items?.[0]?.type === 'FormalParameter' &&
                error.params.items[0].pattern.type === 'Identifier'
                  ? sourceTextFromNode(context, error.params.items[0])
                  : 'err';
              const errorParamName =
                error?.params?.items?.[0]?.type === 'FormalParameter' &&
                error.params.items[0].pattern.type === 'Identifier'
                  ? error.params.items[0].pattern.name
                  : 'err';

              let errorBody = '';
              if (error) {
                errorBody += (error.body?.statements || [])
                  .map((s) => sourceTextFromNode(context, s))
                  .join('\n');
              }
              if (complete) {
                const completBody = `if (${errorParamName} instanceof EmptyError) { ${(complete.body?.statements || []).map((s) => sourceTextFromNode(context, s)).join('\n')}}`;
                if (errorBody) {
                  errorBody = `${completBody} else { ${errorBody} }`;
                } else {
                  errorBody = completBody;
                }
              }

              newContent = `try { ${newContent} } catch (${errorParam}) { ${errorBody} }`;
            }

            const newNodes = parseSync('index.html', newContent).program.body;

            magicString.remove(child.start, child.end);
            magicString.appendLeft(child.start, newContent);

            newChildren.push(...newNodes);
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
