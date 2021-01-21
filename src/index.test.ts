import { resolve } from "path";
import { transformSync } from "@babel/core";
import { expect, test } from "@jest/globals";
import plugin from "./index";

test("babel-plugin-replace-import-prefix", () => {
  const result = transformSync(`import "~/index.ts"`, {
    babelrc: false,
    configFile: false,
    plugins: [[plugin, { "~/": "./src/" }]],
  });

  expect(result).toMatchInlineSnapshot(`import "./src/index.ts";`);
});
