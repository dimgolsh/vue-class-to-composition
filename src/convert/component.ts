import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getDecoratorArguments } from './helpers';

// @Component({ i18n, components: { NotificationTemplate, MdButton } })
export const getComponentOptions = (node: NodePath<t.ExportDefaultDeclaration>) => {
	if (!t.isClassDeclaration(node.node.declaration)) {
		return [];
	}

	const args = getDecoratorArguments(node.node.declaration);

	if (!args) {
		return [];
	}
	return args.filter(n => t.isObjectExpression(n))
		.flatMap(t => t.properties)
		.filter(n => t.isObjectProperty(n));

};
