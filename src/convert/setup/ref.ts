import * as t from '@babel/types';
import {getBodyClass, isHasDecorator} from '../helpers';
import ConversionStore from '../store';
import {NodePath} from "@babel/traverse";

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
	const name = prop.key.name;
	ConversionStore.addRef(name);
	ConversionStore.addShortReturnStatementByName(name);
	return res;
};

export const getRefs = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const body = getBodyClass(node);
	if (!body) {
		return [];
	}

	const properties = body.body.filter((n) => t.isClassProperty(n)).filter((n) => !isHasDecorator(n, 'Prop'));

	const declarations: t.VariableDeclaration[] = [];
	for (const prop of properties) {
		const res = transformToRef(prop);
		if (res) {
			declarations.push(res);
		}
	}

	return declarations;
};
