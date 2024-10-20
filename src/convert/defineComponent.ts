import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getClassPropertiesByDecoratorName } from './utils';


const getComponentName = (node: NodePath<t.ExportDefaultDeclaration>) => {
	if (t.isClassDeclaration(node.node.declaration)) {
		const decl = node.node.declaration;
		return t.objectProperty(t.identifier('name'), t.stringLiteral(decl.id.name));
	}
	return null;
};


const getProps = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const classProperties = getClassPropertiesByDecoratorName(node, 'Prop');

	console.log(classProperties);

	for (const property of classProperties) {
		const name = (property.key as t.Identifier).name;
		console.log(name)
	}

	//	@Prop({ type: Object, required: true })
	//   public value: INotificationModel;
};


export const getDefineComponent = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const componentName = getComponentName(node);
	const props = getProps(node);

	const properties: t.ObjectProperty[] = [
		componentName,
	].filter(n => !!n);

	const defineComponent = t.exportDefaultDeclaration(t.callExpression(t.identifier('defineComponent'), [
		t.objectExpression([...properties]),
	]));

	return defineComponent;
};
