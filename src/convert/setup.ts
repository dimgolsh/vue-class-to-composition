import * as t from '@babel/types';
import { wrapNewLineComment } from './utils';
import ConversionStore from './store';
import { getParamsSetup } from './setup/params';

export const createSetup = (nodes: t.Statement[] = []) => {
	const before = ConversionStore.getBeforeSetupStatements().values();
	const after = ConversionStore.getAfterSetupStatements().values();

	const returnPropeties = ConversionStore.getReturnStatement();

	const returnStatement = returnPropeties.size
		? t.returnStatement(t.objectExpression([...returnPropeties.values()]))
		: null;

	const result = [
		...before.map(wrapNewLineComment),
		...nodes.map(wrapNewLineComment),
		...after.map(wrapNewLineComment),
		wrapNewLineComment(returnStatement),
	].filter((n) => !!n);

	if (result.length === 0) {
		return null;
	}

	const block = t.blockStatement(result);

	return t.objectMethod('method', t.identifier('setup'), getParamsSetup(), block);
};
