import * as t from '@babel/types';
import { createShortHandProperty } from '../helpers';
import { TransformPlugin } from '../types';

export const useValidatePlugin: TransformPlugin = ({ ast, t, traverse, store }) => {
	const names: t.ObjectProperty[] = [];
	const rules: t.ObjectProperty[] = [];

	traverse(ast, {
		Decorator(path) {
			if (t.isCallExpression(path.node.expression) && t.isIdentifier(path.node.expression.callee)) {
				const name = path.node.expression.callee.name;
				if (name === 'Validate') {
					if (t.isClassMethod(path.parent) || t.isClassProperty(path.parent)) {
						const nameProperty = (path.parent.key as t.Identifier).name;
						const arg = path.node.expression.arguments[0];
						if (t.isExpression(arg)) {
							rules.push(t.objectProperty(t.identifier(nameProperty), arg));
							names.push(createShortHandProperty(nameProperty));
						}
					}
				}
			}
		},
	});

	if (rules.length === 0) {
		return;
	}

	const $v = t.variableDeclaration('const', [
		t.variableDeclarator(
			t.identifier('$v'),
			t.callExpression(t.identifier('useVuelidate'), [t.objectExpression(rules), t.objectExpression(names)]),
		),
	]);

	const statement = t.expressionStatement(
		t.callExpression(t.identifier('provide'), [t.stringLiteral('$v'), t.identifier('$v')]),
	);

	store.addAfterSetupStatement($v);
	store.addAfterSetupStatement(statement);
	store.addImport('vue', 'provide');
	store.addRef('$v');
};
