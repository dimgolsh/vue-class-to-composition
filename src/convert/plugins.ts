import ConversionStore from './store';
import { PluginParams, TransformPlugin } from './types';
import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { serverClientPlugin } from './plugins/serverClientPlugin';
import { i18nPlugin } from './plugins/i18n';
import { useRouterPlugin } from './plugins/useRouter';
import { useValidatePlugin } from './plugins/validate';
import { usePopupPlugin } from './plugins/popup';

export const definePlugin = (name: string, plugin: TransformPlugin): TransformPlugin => {
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

export const defaultPlugins = [serverClientPlugin, i18nPlugin, useRouterPlugin, useValidatePlugin, usePopupPlugin];
