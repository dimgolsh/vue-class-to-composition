import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getProps } from './props';

const getComponentName = (node: NodePath<t.ExportDefaultDeclaration>) => {
	if (t.isClassDeclaration(node.node.declaration)) {
		const decl = node.node.declaration;
		return t.objectProperty(t.identifier('name'), t.stringLiteral(decl.id.name));
	}
	return null;
};

export const getDefineComponent = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const componentName = getComponentName(node);
	const props = getProps(node);

	const properties: t.ObjectProperty[] = [componentName, props].filter((n) => !!n);

	const defineComponent = t.exportDefaultDeclaration(
		t.callExpression(t.identifier('defineComponent'), [t.objectExpression([...properties])]),
	);

	return defineComponent;
};
