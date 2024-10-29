import traverse from '@babel/traverse';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import ConversionStore from '../store';

const contextKey = new Map([
	['$attrs', 'attrs'],
	['$parent', 'parent'],
	['$root', 'root'],
	['$listeners', 'listeners'],
	['$emit', 'emit'],
]);

export const replaceContext = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (contextKey.has(propertyName)) {
					const newExpression = t.identifier(contextKey.get(propertyName));
					path.replaceWith(newExpression);
					ConversionStore.addSetupContextKey(contextKey.get(propertyName));
					return;
				}
			}
		},
	});
};
