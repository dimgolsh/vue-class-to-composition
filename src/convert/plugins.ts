import ConversionStore from './store';
import { PluginParams, TransformPlugin } from './types';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export const definePlugin = (name: string, plugin: TransformPlugin): TransformPlugin => {
	console.log(name);
	ConversionStore.registerPlugin(name, plugin);
	return plugin;
};

export const usePlugins = (ast: ParseResult<t.File>, plugins: TransformPlugin[] = []) => {
	// Plugins
	const pluginParams: PluginParams = {
		ast,
		t,
		traverse,
		store: ConversionStore,
	};

	ConversionStore.getPlugins().forEach((plugin) => plugin(pluginParams));
	plugins.forEach((plugin) => plugin(pluginParams));
};
