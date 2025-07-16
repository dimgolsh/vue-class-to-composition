import { beforeValidate, checkHasClassComponent, parseVueFromContent } from '../utils';
import { parse } from '@babel/parser';

export const checkVueClass = async (content: string) => {
	try {
		const desc = parseVueFromContent(content);

		// Validate before convert
		const validate = beforeValidate(desc);

		if (!validate.isOk) {
			return false;
		}

		// AST
		const ast = parse(desc.script.content, {
			sourceType: 'module',
			plugins: ['typescript', 'decorators'],
			errorRecovery: true,
		});

		// Check has class component
		return checkHasClassComponent(ast);
	} catch (error) {
		return false;
	}
};
