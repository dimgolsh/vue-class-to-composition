import * as t from '@babel/types';
import { getBodyClass, isHasDecorator } from '../helpers';
import ConversionStore from '../store';
import traverse, { NodePath } from '@babel/traverse';
import { ParseResult } from '@babel/parser';

export const saveRefName = (prop: t.ClassProperty) => {
	if (isHasDecorator(prop, 'Prop')) {
		return;
	}
	if (!t.isIdentifier(prop.key)) {
		return;
	}
	const name = prop.key.name;
	ConversionStore.addRef(name);
};

export const savesRefNames = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		ClassProperty: (path) => {
			saveRefName(path.node);
		},
	});
};

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
	const name = prop.key.name;
	ConversionStore.addShortReturnStatementByName(name);

	if (ConversionStore.hasExcludeRefsName(name)) {
		return t.variableDeclaration('const', [t.variableDeclarator(prop.key, value)]);
	}

	const res = t.variableDeclaration('const', [t.variableDeclarator(prop.key, ref)]);
	ConversionStore.addRef(name);
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

	if (ConversionStore.hasRefsSize()) {
		ConversionStore.addImport('vue', 'ref');
	}

	return declarations;
};
