import * as prettier from 'prettier/standalone';
import * as html from 'prettier/plugins/html';
import { defaultPrettierConfig } from '../config';
import chalk from 'chalk';

export const formatCode = async (rawVueCode: string) => {
	try {
		return await prettier.format(rawVueCode, {
			parser: 'vue',
			plugins: [html],
			// From config
			...defaultPrettierConfig,
		});
	} catch (e) {
		console.log(chalk.red('✖ Error formatting file'));
		return rawVueCode;
	}
};
