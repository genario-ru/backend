import { defineConfig, type UserConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { kebabCase } from "text-case";

const API_DIR = "deps/api";
const API_OUTPUT_DIR = "src/codegen/api";

type ClientConfig = Parameters<typeof pluginClient>[0];

type CreateConfigParams = {
  input: string;
  output: string;
  clientConfig: ClientConfig;
};

export default defineConfig(() => {
  return [
    createConfig({
      input: `${API_DIR}/tochka.json`,
      output: `${API_OUTPUT_DIR}/tochka`,
      clientConfig: {
        parser: "zod",
        pathParamsType: "object",
        paramsType: "object",
        importPath: "@/lib/tochka/api/client.ts",
        transformers: {
          name: kebabCaseTransformer,
        },
      },
    }),
    createConfig({
      input: `${API_DIR}/yookassa.json`,
      output: `${API_OUTPUT_DIR}/yookassa`,
      clientConfig: {
        parser: "zod",
        pathParamsType: "object",
        paramsType: "object",
        importPath: "@/lib/tochka/api/client.ts",
        transformers: {
          name: kebabCaseTransformer,
        },
      },
    }),
  ];
});

function kebabCaseTransformer(
  name: string,
  type?: "file" | "function" | "type" | "const",
): string {
  // Только имена файлов делаем kebab-case
  // Типы/функции/константы оставляем как есть (PascalCase/CamelCase)
  if (type === "file") {
    return kebabCase(name);
  }
  return name;
}

function createConfig({
  input,
  output,
  clientConfig,
}: CreateConfigParams): UserConfig {
  return {
    input: {
      path: input,
    },
    output: {
      path: output,
      lint: "eslint",
      format: "prettier",
      clean: true,
    },
    plugins: [
      pluginOas({
        discriminator: "inherit",
        // ← ЭТО ОТКЛЮЧАЕТ ВСЕ JSON-схемы полностью
        // (в старых версиях было output: false, сейчас — generators: [])
        generators: [],
      }),
      pluginTs({
        output: {
          path: "models",
        },
        transformers: {
          name: kebabCaseTransformer,
        },
      }),
      pluginZod({
        importPath: "@/lib/zod/index.ts",
        output: {
          path: "zod",
        },
        transformers: {
          name: kebabCaseTransformer,
        },
      }),
      pluginClient(clientConfig),
    ],
  };
}
