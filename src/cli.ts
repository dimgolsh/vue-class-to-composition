#!/usr/bin/env node

import { Command } from 'commander';
import { convertSingleFile } from './cli/convert-single';
import { convertFolder } from './cli/convert-folder';
import { ConvertSingleFileOptions } from './convert/types';
import { checkVueClassFile } from './cli/check-vue-class';

const program = new Command();

program
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	.version((require('../package.json') as { version: string }).version)
	.description('Vue Class Component to Composition API Converter')
	.usage('<command> [options]');

program
	.command('single <filepath>')
	.description('Convert a single Vue file to Composition API')
	.option('-v, --view', 'Preview changes in the editor')
	.option('-p --pluginsDir <DIR_PATH>', 'Path to directory with plugins')
	.action((filepath: string, options: ConvertSingleFileOptions) => {
		convertSingleFile(filepath, options);
	});

program
	.command('folder <filePath>')
	.description('Convert folder vue files to Composition API')
	.option('-p --pluginsDir <DIR_PATH>', 'Path to directory with plugins')
	.action((filepath: string) => {
		convertFolder(filepath);
	});

program
	.command('check-vue-class <filepath>')
	.description('Check if the file is using the Vue Class Component')
	.action((filepath: string) => {
		checkVueClassFile(filepath);
	});

program.parse(process.argv);
