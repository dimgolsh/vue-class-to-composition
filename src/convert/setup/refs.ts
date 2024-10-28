import * as t from '@babel/types';
import { isHasDecorator } from '../helpers';
import ConversionStore from '../store';

export const transformToRef = (prop: t.ClassProperty) => {
	if (isHasDecorator(prop, 'Prop')) {
		return null;
	}
	if (!t.isIdentifier(prop.key)) {
		return null;
	}

	const value = prop.value ? prop.value : t.nullLiteral();
	const getRef = () => {
		if (prop.typeAnnotation && t.isTSTypeAnnotation(prop.typeAnnotation)) {
			const withType = t.tsInstantiationExpression(
				t.identifier('ref'),
				t.tsTypeParameterInstantiation([prop.typeAnnotation.typeAnnotation]),
			);
			return t.callExpression(withType, [value]);
		}
		return t.callExpression(t.identifier('ref'), [value]);
	};
	const ref = getRef();
	const res = t.variableDeclaration('const', [t.variableDeclarator(prop.key, ref)]);
	ConversionStore.addReturnStatement(
		prop.key.name,
		t.objectProperty(t.identifier(prop.key.name), t.identifier(prop.key.name), false, true),
	);
	return res;
};

export const getRefs = (properties: t.ClassProperty[]) => {
	const declarations: t.VariableDeclaration[] = [];
	for (const prop of properties) {
		const res = transformToRef(prop);
		if (res) {
			declarations.push(res);
		}
	}

	return declarations;
};
