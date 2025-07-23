import { TransformPlugin } from '../types';

export const useRouterPlugin: TransformPlugin = ({ ast, t, traverse, store }) => {
	const keys = new Map([
		['$route', { key: 'route', import: { source: 'vue-router/composables', path: 'useRoute' } }],
		['$router', { key: 'router', import: { source: 'vue-router/composables', path: 'useRouter' } }],
	]);

	const addedKeys = new Set<string>();

	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (keys.has(propertyName)) {
					const result = keys.get(propertyName);

					// 1. replace this.router to router
					path.replaceWith(t.identifier(result.key));

					// 2. Add Import { useRoute } from 'vue-router/composables';
					store.addImport(result.import.source, result.import.path);

					// 3. Add const router = useRouter()
					const declaration = t.variableDeclaration('const', [
						t.variableDeclarator(t.identifier(result.key), t.callExpression(t.identifier(result.import.path), [])),
					]);
					if (!addedKeys.has(result.key)) {
						store.addBeforeSetupStatement(declaration);
						addedKeys.add(result.key);
					}
				}
			}
		},
	});
};
