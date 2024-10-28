import {ParseResult} from "@babel/parser";
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import ConversionStore from "../store";

export const i18nPlugin = (ast: ParseResult<t.File>) => {
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

    // 2. Add const {t, n} = useI18n(i18n);
    const i18n = t.variableDeclaration('const', [
        t.variableDeclarator(
            t.objectPattern([
                ...existKeys.values().map((name) => t.objectProperty(t.identifier(name), t.identifier(name), false, true)),
            ]),
            t.callExpression(t.identifier('useI18n'), [t.identifier('i18n')]),
        ),
    ]);
    ConversionStore.addBeforeSetupStatement('i18n', i18n);

    // 3. Add Import { useI18n } from 'vue-i18n';
    ConversionStore.addImport('common/composables/use-i18n', 'useI18n');

};
