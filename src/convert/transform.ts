import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import { NodePath } from '@babel/traverse';
import { replaceThis } from './this-transform';
import { getComponentName, getDefaultNode } from './helpers';
import { getComponentOptions } from './component';
import { getProps } from './props';
import { createSetup } from './setup';
import { getOtherNodes } from './other';
import { getImportsNodes } from './imports';
import { wrapNewLineComment } from './utils';
import { replaceContext } from './setup/context';
import { replaceRefsToRef } from './setup/refs';
import { replaceVueHooks } from './setup/vue';
import { getRefs } from './setup/ref';
import { getComputeds } from './setup/computed';
import { getMethods } from './setup/methods';
import ConversionStore from './store';
import { defaultPlugins, usePlugins } from './plugins';
import { TransformPlugin } from './types';
import { replaceWatchDecorator } from './vue-property-decorator/watch';
import { createDefineComponent } from './defineComponent';

export interface TransformOptions {
	plugins: TransformPlugin[];
}

export const transform = (ast: ParseResult<t.File>, options: TransformOptions) => {
	const { plugins = [] } = options ?? {};
	// Before clear store
	ConversionStore.clear();

	const node: NodePath<t.ExportDefaultDeclaration> = getDefaultNode(ast);
	// Plugins
	usePlugins(ast, [...defaultPlugins, ...plugins]);

	const otherNodes = getOtherNodes(ast);
	const componentName = getComponentName(node);
	const componentOptions = getComponentOptions(node);
	const props = getProps(node);

	const refs = getRefs(node);
	const computeds = getComputeds(node);
	const methods = getMethods(node);

	replaceContext(ast);
	replaceRefsToRef(ast);
	replaceVueHooks(ast);
	replaceWatchDecorator(ast);

	// Replace this.
	replaceThis(ast);

	const setup = createSetup([...refs, ...computeds, ...methods]);

	const properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement> = [
		componentName,
		...componentOptions,
		props,
		setup,
	].filter((n) => !!n);

	const defineComponent = createDefineComponent(properties);

	const imports = getImportsNodes(ast);

	const newAst = t.program([...imports, ...otherNodes.map(wrapNewLineComment), wrapNewLineComment(defineComponent)]);

	return newAst;
};
