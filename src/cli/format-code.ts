import * as prettier from 'prettier';
import { defaultPrettierConfig } from '../config';
import chalk from 'chalk';

export const formatCode = async (rawVueCode: string, filepath: string) => {
	try {
		return await prettier.format(rawVueCode, {
			filepath,
			...defaultPrettierConfig,
		});
	} catch (e) {
		console.log(chalk.red(`✖ Error formatting file: ${filepath}`));
		return rawVueCode;
	}
};
