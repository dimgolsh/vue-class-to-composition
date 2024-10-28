import { parse as parseVue } from '@vue/compiler-sfc';
import * as t from '@babel/types';


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
