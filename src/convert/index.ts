import { beforeValidate, checkHasClassComponent, parseVueFromContent } from './utils';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import { generateVue } from './generateVue';
import { formatCode } from './formatCode';
import { transform } from './transform';
import { ConvertOptions } from './types';

interface ConvertResult {
	isOk: boolean;
	content: string;
	errors: string[];
}

export const convert = async (content: string, options?: ConvertOptions): Promise<ConvertResult> => {
	const { prettierConfig = {}, plugins = [] } = options ?? {};
	// Parse
	const desc = parseVueFromContent(content);

	// Validate before convert
	const validate = beforeValidate(desc);

	if (!validate.isOk) {
		return validate;
	}

	// AST
	const ast = parse(desc.script.content, {
		sourceType: 'module',
		plugins: ['typescript', 'decorators'],
		errorRecovery: true,
	});

	try {
		// Check has class component
		const hasClassComponent = checkHasClassComponent(ast);
		if (!hasClassComponent.isOk) {
			return hasClassComponent;
		}

		// Transform
		const newAst = transform(ast, { plugins });

		// Generate
		const code = generate(newAst, { jsescOption: { quotes: 'single' } }).code;

		// Vue compile
		const rawVue = generateVue(desc, code);

		// Format
		const format = await formatCode(rawVue, prettierConfig);

		return {
			isOk: true,
			content: format,
			errors: [],
		};
	} catch (error) {
		console.log(error);
		return {
			isOk: false,
			content: `Error while converting. \n\n Please send this message to the author: \n\n ${error} \n\n\n ${desc.script.content}`,
			errors: [],
		};
	}
};
