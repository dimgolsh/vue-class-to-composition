import { checkVueClass } from '../convert/check-vue-class';
import { existsFileSync, isVueFile, readFile } from '../utils';

export const checkVueClassFile = async (filepath: string) => {
	try {
		if (!isVueFile(filepath)) {
			return false;
		}

		if (!existsFileSync(filepath)) {
			console.warn(`⚠ File not found: ${filepath}`);
			return false;
		}

		const fileContent = await readFile(filepath);

		const result = await checkVueClass(fileContent);

		if (!result) {
			console.warn(`⚠ Error checking vue class: ${filepath}`);
			return false;
		}

		if (result.isOk) {
			console.log(`⚠ File is contain class component: ${filepath}`);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`✖ Error converting file: ${(error as Error).message}`);
		return null;
	}
};
