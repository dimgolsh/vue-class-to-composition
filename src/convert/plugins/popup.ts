import { TransformPlugin } from '../types';

export const usePopupPlugin: TransformPlugin = ({ ast, t, traverse, store }) => {
	traverse(ast, {
		ExportDefaultDeclaration(path) {
			const declaration = path.node.declaration;

			if (!t.isClassDeclaration(declaration)) {
				return;
			}
			const superClass = declaration.superClass;

			if (!t.isIdentifier(superClass)) {
				return;
			}

			const name = superClass.name;

			if (name !== 'Popup') {
				return;
			}

			const getParams = () => {
				if (t.isTSTypeParameterInstantiation(declaration.superTypeParameters)) {
					const param = declaration.superTypeParameters.params[0];
					if (t.isTSTypeReference(param) && t.isIdentifier(param.typeName)) {
						const typeName = param.typeName;
						const identifier = t.identifier('close');
						const annotation = t.tsTypeAnnotation(t.tsTypeReference(t.identifier(typeName.name)));
						identifier.typeAnnotation = annotation

						return [identifier];
					}

					if (t.isTSVoidKeyword(param)) {
						return [];
					}
				}

				return [];
			};

			const close = t.objectProperty(
				t.identifier('type'),
				t.tsAsExpression(
					t.identifier('Function'),
					t.tsTypeReference(
						t.identifier('PropType'),
						t.tsTypeParameterInstantiation([
							t.tsFunctionType(undefined, getParams(), t.tsTypeAnnotation(t.tsVoidKeyword())),
						]),
					),
				),
			);

			const defaultProperty = t.objectProperty(t.identifier('default'), t.arrowFunctionExpression(getParams(), t.blockStatement([])))

			const res = t.objectProperty(t.identifier('close'), t.objectExpression([close, defaultProperty]));

			store.addProp('close', res);
			store.addPropName('close');
		},
	});
};
