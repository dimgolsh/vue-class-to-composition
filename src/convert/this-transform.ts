import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import ConversionStore from './store';

const contextKey = new Map([
	['$attrs', 'attrs'],
	['$parent', 'parent'],
	['$root', 'root'],
	['$listeners', 'listeners'],
	['$emit', 'emit'],
]);

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

export const thisTransform = (path: NodePath<t.MemberExpression>) => {
	if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
		const propertyName = path.node.property.name;

		const isProp = ConversionStore.hasProp(propertyName);

		// console.log(propertyName);

		if (propertyName === '$refs') {
			console.log(path);
		}

		if (contextKey.has(propertyName)) {
			const newExpression = t.identifier(contextKey.get(propertyName));
			path.replaceWith(newExpression);
			ConversionStore.addSetupContextKey(contextKey.get(propertyName))
			return;
		}

		if (vueFnContextKey.has(propertyName)) {
			const options = vueFnContextKey.get(propertyName);
			const newExpression = t.identifier(options.key);
			ConversionStore.addImport(options.import.source, options.import.path);
			if (options.beforeStatement) {
				ConversionStore.addBeforeSetupStatement(options.import.path, options.beforeStatement);
			}
			path.replaceWith(newExpression);
			return;
		}

		// props
		if (isProp && propertyName) {
			ConversionStore.setFlag('HAS_PROPS', true);
			const newExpression = t.memberExpression(t.identifier('props'), t.identifier(propertyName));
			path.replaceWith(newExpression);
			return;
		}

		// Проверяем, что это не метод, а именно свойство (или реактивная переменная)
		if (propertyName) {
			// Заменяем this.someProp на просто someProp
			const newExpression = t.memberExpression(t.identifier(propertyName), t.identifier('value'));
			// path.replaceWith(newExpression);
		}
	}
};
