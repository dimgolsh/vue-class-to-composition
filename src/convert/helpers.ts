import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';

export const getDecoratorArguments = (property: t.ClassProperty) => {
	if (!property.decorators) {
		return null;
	}
	const [decorator] = property.decorators;
	if (!t.isCallExpression(decorator.expression)) {
		return null;
	}

	return decorator.expression.arguments;
};


export const getBodyClass = (node: NodePath<t.ExportDefaultDeclaration>) => {
	if (!t.isClassDeclaration(node.node.declaration)) {
		return null;
	}
	return node.node.declaration.body;
};