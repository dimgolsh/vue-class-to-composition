import * as t from '@babel/types';
import { createShortHandProperty } from './helpers';
import { TransformPlugin } from './types';

const props = new Set<string>();
const flags = new Map<string, boolean>();
const imports = new Map<string, Map<string, { value: string; isDefault: boolean }>>();

const beforeSetupStatement = new Map<string, t.Statement>(null);
const afterSetupStatement = new Map<string, t.Statement>(null);
const setupContextKeys = new Set<string>();
const refsName = new Set<string>();
const excludeRefsName = new Set<string>();
const returnStatement = new Map<string, t.ObjectMethod | t.ObjectProperty | t.SpreadElement>(null);
const plugins = new Map<string, TransformPlugin>();

const ConversionStore = (() => {
	const addRef = (name: string) => {
		refsName.add(name);
	};

	const addExcludeRef = (name: string) => {
		excludeRefsName.add(name);
	};

	const hasExcludeRefsName = (name: string) => {
		return excludeRefsName.has(name);
	};

	const hasRefName = (name: string) => {
		return refsName.has(name);
	};

	const addReturnStatement = (name: string, node: t.ObjectMethod | t.ObjectProperty | t.SpreadElement) => {
		returnStatement.set(name, node);
	};

	const addShortReturnStatementByName = (name: string) => {
		returnStatement.set(name, createShortHandProperty(name));
	};

	const getReturnStatement = () => {
		return returnStatement;
	};

	const addSetupContextKey = (name: string) => {
		setupContextKeys.add(name);
	};

	const getSetupContextKeys = () => {
		return setupContextKeys;
	};

	const addBeforeSetupStatement = (name: string, node: t.Statement) => {
		beforeSetupStatement.set(name, node);
	};

	const getBeforeSetupStatements = () => {
		return beforeSetupStatement;
	};

	const addAfterSetupStatement = (name: string, node: t.Statement) => {
		afterSetupStatement.set(name, node);
	};

	const getAfterSetupStatements = () => {
		return afterSetupStatement;
	};

	const addImport = (source: string, key: string, isDefault = false) => {
		if (imports.has(source)) {
			const current = imports.get(source);
			current.set(key, { value: key, isDefault });
		} else {
			imports.set(source, new Map([[key, { value: key, isDefault }]]));
		}
	};

	const getImports = () => {
		return imports;
	};

	// Метод для добавления пропса
	const addProp = (propName: string) => {
		props.add(propName);
	};

	// Метод для проверки наличия пропса
	const hasProp = (propName: string): boolean => {
		return props.has(propName);
	};

	// Метод для установки флага
	const setFlag = (flagName: string, value: boolean) => {
		flags.set(flagName, value);
	};

	// Метод для получения значения флага
	const getFlag = (flagName: string): boolean | undefined => {
		return flags.get(flagName);
	};

	// Методы для управления плагинами
	const registerPlugin = (name: string, plugin: TransformPlugin) => {
		plugins.set(name, plugin);
	};

	const getPlugins = () => {
		return Array.from(plugins.values());
	};


	const clear = () => {
		imports.clear();
		props.clear();
		flags.clear();
		beforeSetupStatement.clear();
		afterSetupStatement.clear();
		setupContextKeys.clear();
		refsName.clear();
		excludeRefsName.clear();
		returnStatement.clear();
	};


	const printStore = () => {
		console.log('Props:', Array.from(props));
		console.log('Flags:', Array.from(flags.entries()));
		console.log('Imports:', Array.from(imports.entries()));
		console.log('Return:', Array.from(returnStatement.entries()));
	};

	return {
		addProp,
		hasProp,
		setFlag,
		getFlag,
		clear,
		printStore,
		addImport,
		getImports,
		addBeforeSetupStatement,
		getBeforeSetupStatements,
		addSetupContextKey,
		getSetupContextKeys,
		addAfterSetupStatement,
		getAfterSetupStatements,
		addReturnStatement,
		getReturnStatement,
		addRef,
		hasRefName,
		addShortReturnStatementByName,
		addExcludeRef,
		hasExcludeRefsName,
		registerPlugin,
		getPlugins
	};
})();

export default ConversionStore;
