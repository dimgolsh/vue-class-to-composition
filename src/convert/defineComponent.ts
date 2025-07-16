import * as t from '@babel/types';
import ConversionStore from './store';

export const createDefineComponent = (properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>) => {
	const defineComponent = t.exportDefaultDeclaration(
		t.callExpression(t.identifier('defineComponent'), [t.objectExpression([...properties])]),
	);

	ConversionStore.addImport('vue', 'defineComponent');

	return defineComponent;
};
