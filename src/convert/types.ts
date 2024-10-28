import * as t from '@babel/types';

export interface ConstVariables {
	identifier: t.Identifier;
	objectProperties: Map<string, t.ObjectProperty>;
	init: t.CallExpression;
}

export interface ConstVariable {
	identifier: t.Identifier;
	objectProperty: { key: string; value: t.ObjectProperty };
	init: t.CallExpression;
}
