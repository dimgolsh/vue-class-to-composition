import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';

export const getOtherNodes = (ast: ParseResult<t.File>) => {
	return ast.program.body.filter((n) => !t.isExportDefaultDeclaration(n)).filter((n) => !t.isImportDeclaration(n));
};
