import * as t from '@babel/types';
import { ParseResult } from '@babel/parser';
import traverse from '@babel/traverse';
import ConversionStore from './store';

// Тип для параметров плагина
export interface PluginParams {
	ast: ParseResult<t.File>;
	t: typeof t;
	traverse: typeof traverse;
	store: typeof ConversionStore;
}

// Тип для плагина
export type TransformPlugin = (params: PluginParams) => void;


