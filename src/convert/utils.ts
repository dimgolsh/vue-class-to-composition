import { parse as parseVue, SFCDescriptor } from '@vue/compiler-sfc';
import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';

export const newLine = 'REPLACE_FOR_NEW_LINE';

export const parseVueFromContent = (content: string) => {
	const { descriptor, errors } = parseVue(content);
	if (errors.length > 0) {
		throw new Error(errors.join('\n'));
	}
	return descriptor;
};

export const wrapNewLineComment = (
	node: t.VariableDeclaration | t.ExpressionStatement | t.Statement | t.BlockStatement,
) => {
	if (!node) {
		return null;
	}
	node.leadingComments = [{ type: 'CommentLine', value: newLine }];
	return node;
};

export const beforeValidate = (desc: SFCDescriptor) => {
	if (desc.scriptSetup) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ File is already setup'],
		};
	}

	if (!desc.script) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ Vue file is not contain script'],
		};
	}

	if (desc.script.lang !== 'ts') {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ Vue file is not typescript'],
		};
	}

	return { isOk: true, content: desc.script.content, errors: [] };
};

export const checkHasClassComponent = (ast: ParseResult<t.File>) => {
	let hasClassComponent = false;
	traverse(ast, {
		ExportDefaultDeclaration: (path) => {
			const node = path.node.declaration;
			if (t.isClassDeclaration(node)) {
				hasClassComponent = true;
			}
		},
	});

	if (!hasClassComponent) {
		return {
			isOk: false,
			content: '',
			errors: ['⚠ File is not contain class component'],
		};
	}

	return {
		isOk: true,
		content: '',
		errors: [],
	};
};
