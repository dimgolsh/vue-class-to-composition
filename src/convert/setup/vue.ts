import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import ConversionStore from '../store';

const vueFnContextKey = new Map([
	['$watch', { key: 'watch', import: { source: 'vue', path: 'watch' } }],
	[
		'$slots',
		{
			key: 'slots',
			import: { source: 'vue', path: 'useSlots' },
			beforeStatement: t.variableDeclaration('const', [
				t.variableDeclarator(t.identifier('slots'), t.callExpression(t.identifier('useSlots'), [])),
			]),
		},
	],
	['$nextTick', { key: 'nextTick', import: { source: 'vue', path: 'nextTick' } }],
]);

export const replaceVueHooks = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (vueFnContextKey.has(propertyName)) {
					const options = vueFnContextKey.get(propertyName);
					const newExpression = t.identifier(options.key);
					ConversionStore.addImport(options.import.source, options.import.path);
					if (options.beforeStatement) {
						ConversionStore.addBeforeSetupStatement(options.beforeStatement);
					}
					path.replaceWith(newExpression);
					return;
				}
			}
		},
	});
};
