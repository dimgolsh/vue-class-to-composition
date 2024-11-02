import { TransformPlugin } from '../types';

export const serverClientPlugin: TransformPlugin = ({ ast, t, store, traverse }) => {
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
			store.addImport('composables/use-server-client', 'useServerClient', true);
			path.replaceWith(newExpression);
			path.skip();
			if (!Array.isArray(path.container) && t.isClassProperty(path.container)) {
				if (t.isIdentifier(path.container.key)) {
					store.addExcludeRef(path.container.key.name);
				}
			}
		},
	});
};
