import type { default as babel, NodePath, PluginObj, types as t } from "@babel/core";

export type Options = { [prefix: string]: string };

export default ({ types: t }: typeof babel, options: Options): PluginObj => {
  const prefixEntries = Object.entries(options);

  const replaceImportPrefix = (path: string) => {
    for (const [prefix, replacePrefix] of prefixEntries) {
      if (path.startsWith(prefix)) {
        return replacePrefix + path.slice(prefix.length);
      }
    }
  };

  const transformDeclaration = (
    path: NodePath<t.ImportDeclaration> | NodePath<t.ExportAllDeclaration> | NodePath<t.ExportNamedDeclaration>,
  ) => {
    const source = path.get("source");

    if (Array.isArray(source) || !source.isStringLiteral()) {
      return;
    }

    const importPath = replaceImportPrefix(source.node.value);

    if (!importPath) {
      return;
    }

    source.replaceWith(t.stringLiteral(importPath));
  };

  return {
    name: "replace-import-prefix",
    visitor: {
      ImportDeclaration: transformDeclaration,
      ExportAllDeclaration: transformDeclaration,
      ExportNamedDeclaration: transformDeclaration,
      CallExpression(path) {
        if (!path.get("callee").isImport()) {
          return;
        }

        const arg = path.get("arguments.0");

        if (Array.isArray(arg) || !arg.isStringLiteral()) {
          return;
        }

        const importPath = replaceImportPrefix(arg.node.value);

        if (!importPath) {
          return;
        }

        arg.replaceWith(t.stringLiteral(importPath));
      },
    },
  };
};
