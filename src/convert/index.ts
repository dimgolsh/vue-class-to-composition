import { parseVueFromContent } from './utils';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { transform } from './transform';

interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export const convert = async (content: string): Promise<ConvertResult> => {
	// Parse
	const desc = parseVueFromContent(content);

	// AST
	const ast = parse(desc.script.content, {
		sourceType: 'module',
		plugins: ['typescript', 'decorators'],
		errorRecovery: true,
	});

	// Transform
	const newAst = transform(ast);

	// Generate
	const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

	// Vue compile
	const rawVue = generateVue(desc, code);

	// Format
	const format = await formatCode(rawVue);

	return {
		isOk: true,
		content: format,
		errors: [],
	};
};
