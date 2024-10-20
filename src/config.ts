import { Options } from 'prettier';

export const defaultPrettierConfig: Options = {
	singleQuote: true,
	printWidth: 120,
	useTabs: true,
	endOfLine: 'crlf',
	quoteProps: 'consistent',
	bracketSpacing: true,
	bracketSameLine: false,
	trailingComma: 'all',
	htmlWhitespaceSensitivity: 'strict',
	vueIndentScriptAndStyle: true,
	singleAttributePerLine: true,
};
