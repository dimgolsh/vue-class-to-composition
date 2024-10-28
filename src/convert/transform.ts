import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';
import { thisTransform } from './this-transform';
import { getComponentName, getDefaultNode } from './helpers';
import { getComponentOptions } from './component';
import { getProps } from './props';
import { createSetup } from './setup';
import { getOtherNodes } from './other';
import { getImportsNodes } from './imports';
import { wrapNewLineComment } from './utils';
import { i18nPlugin } from './plugins/i18n';
import { useRouterPlugin } from './plugins/useRouter';

export const transform = (ast: ParseResult<t.File>) => {
	const node: NodePath<t.ExportDefaultDeclaration> = getDefaultNode(ast);
	const otherNodes = getOtherNodes(ast);
	const componentName = getComponentName(node);
	const options = getComponentOptions(node);
	const props = getProps(node);

	i18nPlugin(ast);
	useRouterPlugin(ast);

	traverse(ast, {
		MemberExpression: thisTransform,
	});

	const setup = createSetup(node);

	const properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement> = [
		componentName,
		...options,
		props,
		setup,
	].filter((n) => !!n);

	const defineComponent = t.exportDefaultDeclaration(
		t.callExpression(t.identifier('defineComponent'), [t.objectExpression([...properties])]),
	);

	const imports = getImportsNodes(ast);

	const newAst = t.program([
		...imports,
		...otherNodes.map(wrapNewLineComment),
		wrapNewLineComment(defineComponent),
	]);

	return newAst;
};
