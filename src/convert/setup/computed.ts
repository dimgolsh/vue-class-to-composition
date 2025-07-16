import * as t from '@babel/types';
import ConversionStore from '../store';
import { getBodyClass } from '../helpers';
import { NodePath } from '@babel/traverse';

export const getComputeds = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const body = getBodyClass(node);
	if (!body) {
		return [];
	}

	const getters = body.body.filter((n) => t.isClassMethod(n, { kind: 'get' }));
	const setters = body.body.filter((n) => t.isClassMethod(n, { kind: 'set' }));
	const declarations: t.VariableDeclaration[] = [];

	const getterMap: Map<string, t.ClassMethod> = new Map();
	const settersMap: Map<string, t.ClassMethod> = new Map();

	for (const getter of getters) {
		const key = (getter.key as t.Identifier).name;
		getterMap.set(key, getter);
	}

	for (const setter of setters) {
		const key = (setter.key as t.Identifier).name;
		settersMap.set(key, setter);
	}

	for (const [key, node] of getterMap) {
		// Computed get/set
		if (settersMap.has(key)) {
			const findSet = settersMap.get(key);
			const getter = t.objectProperty(t.identifier('get'), t.arrowFunctionExpression([], node.body));
			const params = findSet.params.filter((n) => t.isIdentifier(n));
			const setter = t.objectProperty(t.identifier('set'), t.arrowFunctionExpression(params, findSet.body));
			const exp = t.callExpression(t.identifier('computed'), [t.objectExpression([getter, setter])]);
			const declaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(key), exp)]);
			declarations.push(declaration);
		} else {
			// Simple computed
			const exp = t.callExpression(t.identifier('computed'), [t.arrowFunctionExpression([], node.body)]);
			const declaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(key), exp)]);
			declarations.push(declaration);
		}

		ConversionStore.addShortReturnStatementByName(key);
		ConversionStore.addImport('vue', 'computed');
		ConversionStore.addRef(key);
	}

	return declarations;
};
