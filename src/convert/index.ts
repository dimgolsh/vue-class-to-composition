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

	console.log(ast);

	let defaultNode: NodePath<t.ExportDefaultDeclaration> = null;

	traverse(ast, {
		Decorator(path) {
			console.log(path);
		},
		ExportDefaultDeclaration(path) {
			defaultNode = path;
		},
	});


	console.log(defaultNode);
	const defineComponent = getDefineComponent(defaultNode);


	const newAst = t.program([...ast.program.body, defineComponent]);

	const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

	const rawVue = generateVue(desc, code);

	const format = await formatCode(rawVue);

	return {
		isOk: true,
		content: format,
		errors: [],
	};
};
