import { parseVueFromContent } from './utils';
import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { getDefineComponent } from './defineComponent';

interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export const convert = async (content: string): Promise<ConvertResult> => {
	const desc = parseVueFromContent(content);

	const ast = parse(desc.script.content, {
		sourceType: 'module',
		plugins: ['typescript', 'decorators'],
		errorRecovery: true,
	});

	let defaultNode: NodePath<t.ExportDefaultDeclaration> = null;

	traverse(ast, {
		ExportDefaultDeclaration(path) {
			defaultNode = path;
		},
		MemberExpression(path) {
			console.log(path)
		}
	});

	const defineComponent = getDefineComponent(defaultNode);
	console.log(defaultNode)

	const newAst = t.program([defineComponent, ...ast.program.body]);

	const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

	const rawVue = generateVue(desc, code);

	const format = await formatCode(rawVue);

	return {
		isOk: true,
		content: format,
		errors: [],
	};
};
