import * as fs from 'fs';
import * as path from 'path';
import { definePlugin } from '../convert/plugins';

export const registerPlugins = async (pluginsDir: string) => {
	if (!fs.existsSync(pluginsDir)) {
		return;
	}

	const pluginFiles = fs.readdirSync(pluginsDir).filter((file) => file.endsWith('.js'));

	for (const file of pluginFiles) {
		const pluginPath = path.join(pluginsDir, file);
		const pluginModule = await import(pluginPath);

		if (pluginModule.default) {
			const plugin = pluginModule.default;
			definePlugin(plugin.name, plugin);
		}
	}
};
