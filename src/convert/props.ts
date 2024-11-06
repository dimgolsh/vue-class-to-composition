import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getClassPropertiesByDecoratorName } from './helpers';
import ConversionStore from './store';
import { transformProp } from './vue-property-decorator/props';

export const getProps = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const classProperties = getClassPropertiesByDecoratorName(node, 'Prop');

	const properties: t.ObjectProperty[] = [...ConversionStore.getProps().values()];

	for (const property of classProperties) {
		const res = transformProp(property);
		if (res) {
			properties.push(res);
		}
	}

	if (properties.length === 0) {
		return null;
	}

	return t.objectProperty(t.identifier('props'), t.objectExpression(properties));
};
