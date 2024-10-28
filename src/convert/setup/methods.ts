import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import { getBodyClass } from '../helpers';
import ConversionStore from '../store';

const legacyHooks = new Map([
	['beforeCreate', 'beforeCreate'],
	['created', 'created'],
]);

const internalHooks = new Map([
	['beforeMount', 'onBeforeMount'],
	['mounted', 'onMounted'],
	['beforeDestroy', 'onBeforeUnmount'],
	['destroyed', 'onUnmounted'],
	['beforeUpdate', 'onBeforeUpdate'],
	['updated', 'onUpdated'],
	['activated', 'onActivated'],
	['deactivated', 'onDeactivated'],
	['render', 'onRender'],
	['errorCaptured', 'onErrorCaptured'],
	['serverPrefetch', 'onServerPrefetch'],
]);

const transformMethod = (node: t.ClassMethod) => {
	if (t.isIdentifier(node.key)) {
		console.log(node);
		const name = node.key.name;
		const body = node.body;
		const params = node.params.filter((n) => t.isIdentifier(n) || t.isPattern(n) || t.isRestElement(n));
		const expression = t.arrowFunctionExpression([...params], body, node.async);

		// beforeCreate
		if (legacyHooks.has(name)) {
			const legacyName = legacyHooks.get(name);
			const result = t.variableDeclaration('const', [
				t.variableDeclarator(t.identifier(legacyHooks.get(name)), expression),
			]);
			ConversionStore.addAfterSetupStatement(
				'created',
				t.expressionStatement(t.callExpression(t.identifier(legacyName), [])),
			);
			return result;
		}
		// mounted -> onMounted
		if (internalHooks.has(name)) {
			const newName = internalHooks.get(name);
			const result = t.expressionStatement(t.callExpression(t.identifier(newName), [expression]));
			ConversionStore.addImport('vue', newName);
			return result;
		}

		// other methods
		const result = t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), expression)]);
		ConversionStore.addReturnStatement(name, t.objectProperty(t.identifier(name), t.identifier(name), false, true));
		return result;
	}

	return null;
};

export const getMethods = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const body = getBodyClass(node);
	if (!body) {
		return [];
	}
	const statements: t.Statement[] = [];
	const methods = body.body.filter((n) => t.isClassMethod(n, { kind: 'method' }));

	for (const method of methods) {
		const result = transformMethod(method);
		if (result) {
			statements.push(result);
		}
	}
	return statements;
};
