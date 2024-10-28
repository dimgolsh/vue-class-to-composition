import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getBodyClass, isHasDecorator } from './helpers';
import { wrapNewLineComment } from './utils';
import ConversionStore from './store';
import { getParamsSetup } from './setup/params';
import { getComputeds } from './setup/computed';
import { getRefs } from './setup/refs';
import { getMethods } from './setup/methods';

export const createSetup = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const body = getBodyClass(node);
	if (!body) {
		return null;
	}

	const classProperties = body.body.filter((n) => t.isClassProperty(n)).filter((n) => !isHasDecorator(n, 'Prop'));

	const refs: t.VariableDeclaration[] = getRefs(classProperties);
	const computeds = getComputeds(body);


	const methods = getMethods(node);
	const before = ConversionStore.getBeforeSetupStatements().values();
	const after = ConversionStore.getAfterSetupStatements().values();

	const returnStatement = t.returnStatement(t.objectExpression([...ConversionStore.getReturnStatement().values()]));

	const block = t.blockStatement([
		...before.map(wrapNewLineComment),
		...refs.map(wrapNewLineComment),
		...computeds.map(wrapNewLineComment),
		...methods.map(wrapNewLineComment),
		...after.map(wrapNewLineComment),
		wrapNewLineComment(returnStatement),
	]);

	return t.objectMethod('method', t.identifier('setup'), getParamsSetup(), block);
};
