#!/usr/bin/env node

import { Command } from 'commander';
import { convertSingleFile } from './cli/convert-single';
import { convertFolder } from './cli/convert-folder';

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
	.action((filepath: string, options: Record<string, any>) => {
		convertSingleFile(filepath, options);
	});

program
	.command('folder <filePath>')
	.description('Convert folder vue files to Composition API')
	.action((filepath: string) => {
		convertFolder(filepath);
	});

program.parse(process.argv);
