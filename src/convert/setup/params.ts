import * as t from '@babel/types';
import ConversionStore from '../store';

export const getParamsSetup = (): Array<t.Identifier | t.Pattern | t.RestElement> => {
	const contextKeys = ConversionStore.getSetupContextKeys();
	if (ConversionStore.getFlag('HAS_PROPS') && !contextKeys.size) {
		return [t.identifier('props')];
	}
	if (contextKeys.size) {
		const keys = t.objectPattern([
			...contextKeys.values().map((name) => t.objectProperty(t.identifier(name), t.identifier(name), false, true)),
		]);
		if (ConversionStore.getFlag('HAS_PROPS')) {
			return [t.identifier('props'), keys];
		}
		if (!ConversionStore.getFlag('HAS_PROPS')) {
			return [t.identifier('_'), keys];
		}
	}

	return [];
};
