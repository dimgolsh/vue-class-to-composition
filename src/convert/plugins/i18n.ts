import { createShortHandProperty } from '../helpers';
import { TransformPlugin } from '../types';

export const i18nPlugin: TransformPlugin = ({ ast, t, traverse, store }) => {
	const i18nContextKey = new Map([
		['$t', 't'],
		['$d', 'd'],
		['$tc', 'tc'],
		['$te', 'te'],
		['$n', 'n'],
	]);

	const existKeys = new Set<string>();

	// 1. replace this.$t() to t()
	traverse(ast, {
		MemberExpression: (path) => {
			if (t.isThisExpression(path.node.object) && t.isIdentifier(path.node.property)) {
				const propertyName = path.node.property.name;

				if (i18nContextKey.has(propertyName)) {
					path.replaceWith(t.identifier(i18nContextKey.get(propertyName)));
					existKeys.add(i18nContextKey.get(propertyName));
				}
			}
		},
	});

	if (existKeys.size === 0) {
		return;
	}

	const objectProperties = [...existKeys.values()].map((key) => createShortHandProperty(key));

	// 2. Add const {t, n} = useI18n(i18n);
	const i18n = t.variableDeclaration('const', [
		t.variableDeclarator(
			t.objectPattern(objectProperties),
			t.callExpression(t.identifier('useI18n'), [t.identifier('i18n')]),
		),
	]);
	store.addBeforeSetupStatement(i18n);

	// 3. Add Import { useI18n } from 'vue-i18n';
	store.addImport('common/composables/use-i18n', 'useI18n');
};
