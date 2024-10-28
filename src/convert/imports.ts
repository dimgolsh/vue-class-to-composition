import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import ConversionStore from './store';
import traverse from '@babel/traverse';

const excludesNamesImportSpecifier = ['Component', 'Prop', 'Vue'];

export const addImport = (imports: t.ImportDeclaration[], value: { source: string; specifier: string }) => {
	const findImport = imports.findIndex((importDeclaration) => {
		return importDeclaration.source.value === value.source;
	});

	if (findImport === -1) {
		imports.push(
			t.importDeclaration(
				[t.importSpecifier(t.identifier(value.specifier), t.identifier(value.specifier))],
				t.stringLiteral(value.source),
			),
		);
	} else {
		imports[findImport].specifiers.push(t.importDefaultSpecifier(t.identifier(value.specifier)));
	}

	return imports;
};

export const getImportsNodes = (ast: ParseResult<t.File>) => {
	// Remove excluded imports
	traverse(ast, {
		ImportSpecifier(node) {
			if (t.isIdentifier(node.node.imported)) {
				if (excludesNamesImportSpecifier.includes(node.node.imported.name)) {
					node.remove();
				}
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
		for (const [specifier] of values) {
			addImport(imports, { source: key, specifier });
		}
	}

	return imports;
};
