import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getClassPropertiesByDecoratorName, getDecoratorArguments } from './helpers';
import ConversionStore from './store';

const store = ConversionStore;

const createProp = (name: string, properties: t.ObjectProperty[]) => {
	return t.objectProperty(t.identifier(name), t.objectExpression(properties.filter((n) => !!n)));
};

const requiredProperty = t.objectProperty(t.identifier('required'), t.booleanLiteral(true));

const createPropType = (reference: t.TSType, isArray: boolean) => {
	// type: Object as PropType<INotificationModel>
	// type: Array as PropType<INotificationModel[]>
	const identifier = t.identifier(isArray ? 'Array' : 'Object');
	return t.objectProperty(
		t.identifier('type'),
		t.tsAsExpression(
			identifier,
			t.tsTypeReference(t.identifier('PropType'), t.tsTypeParameterInstantiation([reference])),
		),
	);
};

const transformProp = (property: t.ClassProperty) => {
	const propName = (property.key as t.Identifier).name;
	store.addPropName(propName);

	if (!t.isTSTypeAnnotation(property.typeAnnotation)) {
		return createProp(propName, [requiredProperty]);
	}
	const type = property.typeAnnotation.typeAnnotation;

	const results: Map<string, t.ObjectProperty> = new Map();

	if (t.isTSTypeReference(type)) {
		// type: Object as PropType<INotificationModel>
		results.set('type', createPropType(type, false));
	}

	if (t.isTSArrayType(type)) {
		// type: Array as PropType<INotificationModel[]>
		results.set('type', createPropType(type, true));
	}

	if (t.isTSStringKeyword(type)) {
		// type: String
		const prop = t.objectProperty(t.identifier('type'), t.identifier('String'));
		results.set('type', prop);
	}
	if (t.isTSBooleanKeyword(type)) {
		// type: Boolean
		const prop = t.objectProperty(t.identifier('type'), t.identifier('Boolean'));
		results.set('type', prop);
	}

	if (t.isTSNumberKeyword(type)) {
		// type: Number
		const prop = t.objectProperty(t.identifier('type'), t.identifier('Number'));
		results.set('type', prop);
	}

	const args = getDecoratorArguments(property);

	if (args && args.length > 0) {
		const arg = args[0];
		if (t.isObjectExpression(arg)) {
			for (const property of arg.properties) {
				if (t.isObjectProperty(property) && t.isIdentifier(property.key)) {
					if (!results.get(property.key.name)) {
						results.set(property.key.name, property);
					}
				}
			}
		}
	}

	// TODO: get config options
	if (!results.get('default')) {
		results.set('required', requiredProperty);
	}

	return createProp(propName, [...results.values()]);
};

export const getProps = (node: NodePath<t.ExportDefaultDeclaration>) => {
	const classProperties = getClassPropertiesByDecoratorName(node, 'Prop');

	const properties: t.ObjectProperty[] = [...ConversionStore.getProps().values()];

	for (const property of classProperties) {
		const res = transformProp(property);
		if (res) {
			properties.push(res);
		}
	}

	if (properties.length === 0) {
		return null;
	}

	return t.objectProperty(t.identifier('props'), t.objectExpression(properties));
};
