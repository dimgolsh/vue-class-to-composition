import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import ConversionStore from '../store';

export const useRouterPlugin = (ast: ParseResult<t.File>) => {
	const keys = new Map([
		['$route', { key: 'route', import: { source: 'vue-router/composables', path: 'useRoute' } }],
		['$router', { key: 'router', import: { source: 'vue-router/composables', path: 'useRouter' } }],
	]);

	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (keys.has(propertyName)) {
					const result = keys.get(propertyName);

					// 1. replace this.router to router
					path.replaceWith(t.identifier(result.key));

					// 2. Add Import { useRoute } from 'vue-router/composables';
					ConversionStore.addImport(result.import.source, result.import.path);

					// 3. Add const router = useRouter()
					const declaration = t.variableDeclaration('const', [
						t.variableDeclarator(t.identifier(result.key), t.callExpression(t.identifier(result.import.path), [])),
					]);
					ConversionStore.addBeforeSetupStatement(result.import.path, declaration);
				}
			}
		},
	});
};
