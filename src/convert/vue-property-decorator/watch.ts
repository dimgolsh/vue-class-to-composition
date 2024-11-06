import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import ConversionStore from '../store';

// vue-property-decorator
// @Watch(path: string, options: WatchOptions = {})
export const replaceWatchDecorator = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		Decorator: (path) => {
			const expression = path.node.expression;
			if (!t.isCallExpression(expression)) {
				return;
			}

			if (!t.isIdentifier(expression.callee) || expression.callee.name !== 'Watch') {
				return;
			}

			const args = expression.arguments;
			const key = args[0];
			const options = args[1];

			if (!key || !t.isStringLiteral(key)) {
				return;
			}

			const target = ConversionStore.hasPropName(key.value)
				? t.memberExpression(t.identifier('props'), t.identifier(key.value))
				: t.memberExpression(t.identifier(key.value), t.identifier('value'));

			const bodyName = ((path.parent as t.ClassMethod).key as t.Identifier).name;

			const callArguments: t.Expression[] = [t.arrowFunctionExpression([], target), t.identifier(bodyName)];

			if (options && t.isObjectExpression(options)) {
				callArguments.push(options);
			}

			const watch = t.expressionStatement(t.callExpression(t.identifier('watch'), callArguments));

			ConversionStore.addAfterSetupStatement(watch);
		},
	});
};
