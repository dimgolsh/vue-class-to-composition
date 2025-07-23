import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';

const emitsKey = new Map([['$emit', 'emit']]);

export const getEmits = (ast: ParseResult<t.File>) => {
	const emits = new Set<string>();
	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (emitsKey.has(propertyName)) {
					if (t.isNode(path.container) && t.isCallExpression(path.container)) {
						const firstArgument = path.container.arguments[0];
						if (t.isStringLiteral(firstArgument)) {
							emits.add(firstArgument.value);
						}
					}

					return;
				}
			}
		},
	});

	if (emits.size === 0) {
		return null;
	}

	return t.objectProperty(
		t.identifier('emits'),
		t.arrayExpression(Array.from(emits).map((emit) => t.stringLiteral(emit))),
	);
};
