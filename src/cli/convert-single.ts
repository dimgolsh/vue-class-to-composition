import { existsFileSync, getFullPath, isVueFile, readFile, writeFile } from '../utils';
import chalk from 'chalk';
import { convert } from '../convert';
import { formatCode } from './format-code';

export const convertSingleFile = async (filepath: string, options: Record<string, boolean>) => {
	try {
		if (!isVueFile(filepath)) {
			console.warn(chalk.yellow(`⚠ Not a Vue file: ${filepath}`));
			return null;
		}

		const path = getFullPath(filepath);

		if (!existsFileSync(path)) {
			console.warn(chalk.yellow(`⚠ File not found: ${filepath}`));
			return null;
		}

		const fileContent = await readFile(filepath);
		const { isOk, content, errors } = await convert(fileContent); // Конвертация

		if (isOk) {
			if (options?.view) {
				console.log(content);
			} else {
				const format = await formatCode(content, filepath);
				await writeFile(filepath, format);
				console.log(chalk.green(`✔ Successfully converted file: ${filepath}`));
			}
		} else {
			console.warn(chalk.yellow(`⚠ No changes made to file: ${filepath}`));
			if (errors.length) {
				errors.forEach((error) => {
					console.error(chalk.red(`✖ Error converting file: ${error}`));
				});
				return null;
			}
		}
		return true;
	} catch (error) {
		console.error(chalk.red(`✖ Error converting file: ${(error as Error).message}`));
		return null;
	}
};
