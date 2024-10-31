import traverse from '@babel/traverse';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import ConversionStore from "../store";

export const serverClientPlugin = (ast: ParseResult<t.File>) => {
	traverse(ast, {
		CallExpression: (path) => {
			if (!path.node.arguments) {
				return;
			}

			const arg = path.node.arguments[0];
			if (!arg) {
				return;
			}

			if (!t.isIdentifier(arg)) {
				return;
			}

			const name = arg.name;

			if (!name.endsWith('Client')) {
				return;
			}



			const newExpression = t.callExpression(t.identifier('useServerClient'), [arg]);
			ConversionStore.addImport('composables/use-server-client', 'useServerClient', true);
			path.replaceWith(newExpression);
			path.skip();
			if (!Array.isArray(path.container) && t.isClassProperty(path.container)) {
				if (t.isIdentifier(path.container.key)) {
					console.log(path.container.key.name);
					ConversionStore.addExcludeRef(path.container.key.name);
				}
			}
			// path.replaceInline(newExpression);
		},
	});
};
