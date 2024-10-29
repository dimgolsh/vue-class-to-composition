import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';
import ConversionStore from './store';
import { ParseResult } from '@babel/parser';

export const thisTransform = (path: NodePath<t.MemberExpression>) => {
	if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
		const propertyName = path.node.property.name;

		const isProp = ConversionStore.hasProp(propertyName);

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

			if (ConversionStore.hasRefName(propertyName)) {
				path.replaceWith(newExpression);
			}
			// path.replaceWith(newExpression);
		}
	}
};

export const replaceThis = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		MemberExpression: (path) => {
			thisTransform(path);
		},
	});
};
