import { parse as parseVue } from '@vue/compiler-sfc';
import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getBodyClass } from './helpers';

export const newLine = 'REPLACE_FOR_NEW_LINE';

export const parseVueFromContent = (content: string) => {
	const { descriptor, errors } = parseVue(content);
	if (errors.length > 0) {
		throw new Error(errors.join('\n'));
	}
	return descriptor;
};

export const getClassPropertiesByDecoratorName = (
	node: NodePath<t.ExportDefaultDeclaration>,
	decoratorName: string,
) => {
	const body = getBodyClass(node);
	if (!body) {
		return [];
	}
	const properties = body.body.filter((n) => t.isClassProperty(n));

	if (!properties.length) {
		return [];
	}

	return properties
		.filter((n) => n.decorators?.length)
		.filter((n) => {
			const [decorator] = n.decorators;
			// @Prop
			if (t.isIdentifier(decorator.expression)) {
				return decorator.expression.name === decoratorName;
			}
			if (!t.isCallExpression(decorator.expression)) {
				return false;
			}
			if (!t.isIdentifier(decorator.expression.callee)) {
				return false;
			}
			// @Prop({ type: Object, required: true })
			return decorator.expression.callee.name === decoratorName;
		});
};
