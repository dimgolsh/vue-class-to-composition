import fs, { lstatSync, readdirSync } from 'fs';
import * as path from 'node:path';

export const isVueFile = (path: string): boolean => {
	return path.endsWith('.vue');
};

export const getFullPath = (filePath: string) => {
	const root = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
	return root;
};

export const readFile = (filePath: string) => {
	return fs.readFileSync(filePath, 'utf8');
};

export const writeFile = async (filePath: string, content: string) => {
	fs.writeFileSync(filePath, content, 'utf-8');
};

export function existsFileSync(path: string): boolean {
	return fs.existsSync(path);
}

export function findInDir(dir: string, fileList: string[] = []) {
	const files = readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileExt = path.extname(file);
		const fileStat = lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findInDir(filePath, fileList);
		} else if (fileExt === '.vue') {
			fileList.push(filePath);
		}
	});

	return fileList;
}
