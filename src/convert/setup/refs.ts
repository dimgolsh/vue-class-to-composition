import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import ConversionStore from '../store';

// replace this.$refs to ref
export const replaceRefsToRef = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		MemberExpression: (path) => {
			if (
				t.isMemberExpression(path.node.object) &&
				t.isIdentifier(path.node.object.property, { name: '$refs' }) &&
				t.isIdentifier(path.node.property)
			) {
				// replace this.$refs to ref
				const name = path.node.property.name;
				const ref = t.variableDeclaration('const', [
					t.variableDeclarator(t.identifier(name), t.callExpression(t.identifier('ref'), [t.nullLiteral()])),
				]);

				ConversionStore.addBeforeSetupStatement(name, ref);
				ConversionStore.addShortReturnStatementByName(name);
				ConversionStore.addRef(name);
				const newExpression = t.memberExpression(t.identifier(name), t.identifier('value'));
				path.replaceWith(newExpression);
				return;
			}
		},
	});
};
