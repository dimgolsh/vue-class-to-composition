import * as t from '@babel/types';
import { createShortHandProperty } from './helpers';
import { TransformPlugin } from './types';

const defaultExcludeImports = ['Component', 'Prop', 'Vue', 'Watch'];

const propsNames = new Set<string>();
const flags = new Map<string, boolean>();
const imports = new Map<string, Map<string, { value: string; isDefault: boolean }>>();
const excludesNamesImportSpecifier = new Set(defaultExcludeImports);

const beforeSetupStatement = new Set<t.Statement>(null);
const afterSetupStatement = new Set<t.Statement>(null);
const setupContextKeys = new Set<string>();
const refsName = new Set<string>();
const excludeRefsName = new Set<string>();
const returnStatement = new Map<string, t.ObjectMethod | t.ObjectProperty | t.SpreadElement>(null);
const props = new Map<string, t.ObjectProperty>(null);
const plugins = new Map<string, TransformPlugin>();

const ConversionStore = (() => {
	const getExcludesNamesImportSpecifier = () => {
		return excludesNamesImportSpecifier;
	};

	const addExcludesNamesImportSpecifier = (name: string) => {
		excludesNamesImportSpecifier.add(name);
	};

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

	const hasRefsSize = () => {
		return refsName.size > 0;
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

	const addBeforeSetupStatement = (node: t.Statement) => {
		beforeSetupStatement.add(node);
	};

	const getBeforeSetupStatements = () => {
		return beforeSetupStatement;
	};

	const addAfterSetupStatement = (node: t.Statement) => {
		afterSetupStatement.add(node);
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

	const addProp = (propName: string, node: t.ObjectProperty) => {
		props.set(propName, node);
	};

	const getProps = () => {
		return props;
	};

	// Метод для добавления пропса
	const addPropName = (propName: string) => {
		propsNames.add(propName);
	};

	// Метод для проверки наличия пропса
	const hasPropName = (propName: string): boolean => {
		return propsNames.has(propName);
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
		excludesNamesImportSpecifier.clear();
		propsNames.clear();
		props.clear();
		flags.clear();
		beforeSetupStatement.clear();
		afterSetupStatement.clear();
		setupContextKeys.clear();
		refsName.clear();
		excludeRefsName.clear();
		returnStatement.clear();

		// Default values
		defaultExcludeImports.forEach((value) => {
			excludesNamesImportSpecifier.add(value);
		});
	};

	const printStore = () => {
		console.log('Props:', Array.from(propsNames));
		console.log('Flags:', Array.from(flags.entries()));
		console.log('Imports:', Array.from(imports.entries()));
		console.log('Return:', Array.from(returnStatement.entries()));
	};

	return {
		addPropName,
		hasPropName,
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
		hasRefsSize,
		addShortReturnStatementByName,
		addExcludeRef,
		hasExcludeRefsName,
		registerPlugin,
		getPlugins,
		addProp,
		getProps,
		addExcludesNamesImportSpecifier,
		getExcludesNamesImportSpecifier,
	};
})();

export default ConversionStore;
