import * as prettier from 'prettier/standalone';
import * as html from 'prettier/plugins/html';
import { defaultPrettierConfig } from '../config';
import chalk from 'chalk';
import { Options } from 'prettier';

export const formatCode = async (rawVueCode: string, config?: Options) => {
	try {
		return await prettier.format(rawVueCode, {
			parser: 'vue',
			plugins: [html],
			// From config
			...defaultPrettierConfig,
			...config,
		});
	} catch (e) {
		console.log(chalk.red('✖ Error formatting file'));
		return rawVueCode;
	}
};
