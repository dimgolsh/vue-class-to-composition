import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getProps } from './props';
import { createSetup } from './setup';
import { getComponentOptions } from './component';
import { getComponentName } from './helpers';



export const getDefineComponent = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const componentName = getComponentName(node);
	const options = getComponentOptions(node);
	const props = getProps(node);
	const setup = createSetup(node);

	const properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement> = [componentName, ...options, props, setup].filter((n) => !!n);

	const defineComponent = t.exportDefaultDeclaration(
		t.callExpression(t.identifier('defineComponent'), [t.objectExpression([...properties])]),
	);

	return defineComponent;
};
