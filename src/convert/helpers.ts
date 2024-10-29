import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';
import { ParseResult } from '@babel/parser';

export const getDefaultNode = (ast: ParseResult<t.File>) => {
	let defaultNode: NodePath<t.ExportDefaultDeclaration> = null;

	traverse(ast, {
		ExportDefaultDeclaration(path) {
			defaultNode = path;
		},
	});

	return defaultNode;
};

// Class name
export const getComponentName = (node: NodePath<t.ExportDefaultDeclaration>) => {
	if (t.isClassDeclaration(node.node.declaration)) {
		const decl = node.node.declaration;
		return t.objectProperty(t.identifier('name'), t.stringLiteral(decl.id.name));
	}
	return null;
};

export const getDecoratorArguments = (property: t.ClassProperty | t.ClassDeclaration) => {
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

// @Prop
export const isHasDecorator = (property: t.ClassProperty, decoratorName: string) => {
	if (!property.decorators || property?.decorators?.length === 0) {
		return false;
	}
	return property.decorators.some((decorator) => {
		if (t.isIdentifier(decorator.expression)) {
			return decorator.expression.name === decoratorName;
		}
		if (!t.isCallExpression(decorator.expression) || !t.isIdentifier(decorator.expression.callee)) {
			return false;
		}
		// @Prop({ type: Object, required: true })
		return decorator.expression.callee.name === decoratorName;
	});
};

export const getClassPropertiesByDecoratorName = (
	node: NodePath<t.ExportDefaultDeclaration>,
	decoratorName: string,
) => {
	const body = getBodyClass(node);
	if (!body) {
		return [];
	}
	const properties = body.body.filter((n) => t.isClassProperty(n));

	if (!properties.length) {
		return [];
	}

	return properties.filter((n) => n.decorators?.length).filter((n) => isHasDecorator(n, decoratorName));
};

export const createShortHandProperty = (name: string) => {
	return t.objectProperty(t.identifier(name), t.identifier(name), false, true);
};
