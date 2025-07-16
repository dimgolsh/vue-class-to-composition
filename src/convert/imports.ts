import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import ConversionStore from './store';
import traverse from '@babel/traverse';

export const addImport = (
	imports: t.ImportDeclaration[],
	value: {
		source: string;
		specifier: string;
		isDefault: boolean;
	},
) => {
	const { source, specifier, isDefault } = value;
	const findImport = imports.findIndex((importDeclaration) => {
		return importDeclaration.source.value === source;
	});

	const res = isDefault
		? t.importDefaultSpecifier(t.identifier(specifier))
		: t.importSpecifier(t.identifier(specifier), t.identifier(specifier));

	if (findImport === -1) {
		imports.push(t.importDeclaration([res], t.stringLiteral(value.source)));
	} else {
		imports[findImport].specifiers.push(t.importDefaultSpecifier(t.identifier(specifier)));
	}

	return imports;
};

export const getImportsNodes = (ast: ParseResult<t.File>) => {
	const excludesNamesImportSpecifier = [...ConversionStore.getExcludesNamesImportSpecifier().values()];

	// Remove excluded imports

	traverse(ast, {
		ImportSpecifier(node) {
			if (t.isIdentifier(node.node.imported)) {
				if (excludesNamesImportSpecifier.includes(node.node.imported.name)) {
					node.remove();
				}
			}
		},
		ImportDefaultSpecifier(node) {
			if (excludesNamesImportSpecifier.includes(node.node.local.name)) {
				node.remove();
			}
		},
	});

	traverse(ast, {
		ImportDeclaration(node) {
			if (node.node.specifiers.length === 0) {
				node.remove();
			}
		},
	});

	const imports = ast.program.body.filter((n) => t.isImportDeclaration(n));
	const storeImports = ConversionStore.getImports();

	for (const [key, values] of storeImports) {
		for (const [_, { value, isDefault }] of values) {
			addImport(imports, { source: key, specifier: value, isDefault });
		}
	}

	return imports;
};
