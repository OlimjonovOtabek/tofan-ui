// Downloads the backend Swagger document and rewrites it into a shape ng-openapi-gen handles well.
//
//   npm run api:update                      # http://localhost:5179 (backend `dotnet run`)
//   npm run api:update -- <swagger.json URL or file path>
//   npm run api:generate
//
// The backend (Swashbuckle + minimal APIs) emits:
//   - CLR schema ids such as `Tofan.Common.Domain.Result`1[[Tofan...ExerciseResponse, Tofan..., Version=...]]`
//     -> shortened to `ResultOfExerciseResponse`;
//   - no operationId -> derived from the method and path, e.g. `POST /exercises/{id}/activate`
//     -> `postExercisesByIdActivate`;
//   - no `required` lists, while nullability is precise (`SupportNonNullableReferenceTypes`)
//     -> every property that is not `nullable: true` becomes required.

import { readFile, writeFile } from 'node:fs/promises';

const DEFAULT_SOURCE = 'http://localhost:5179/swagger/v1/swagger.json';
/** Types whose short name would clash with a TypeScript global. */
const NAME_OVERRIDES = new Map([['Tofan.Common.Domain.Error', 'ApiError']]);
const OUTPUT = new URL('../openapi/tofan-api.json', import.meta.url);
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

const source = process.argv[2] ?? DEFAULT_SOURCE;
const spec = await load(source);

renameSchemas(spec);
assignOperationIds(spec);
markNonNullablePropertiesRequired(spec);

await writeFile(OUTPUT, `${JSON.stringify(spec, null, 2)}\n`);
console.log(
  `openapi/tofan-api.json: ${countOperations(spec)} operations, ` +
    `${Object.keys(spec.components.schemas).length} schemas (from ${source})`,
);

async function load(location) {
  if (!/^https?:\/\//.test(location)) {
    return JSON.parse(await readFile(location, 'utf8'));
  }
  const response = await fetch(location);
  if (!response.ok) {
    throw new Error(`GET ${location} -> ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function renameSchemas(document) {
  const fullNames = Object.keys(document.components.schemas);
  const renames = resolveShortNames(fullNames);

  document.components.schemas = Object.fromEntries(
    fullNames.map((fullName) => [renames.get(fullName), document.components.schemas[fullName]]),
  );

  const refPrefix = '#/components/schemas/';
  visit(document, (node) => {
    if (typeof node.$ref === 'string' && node.$ref.startsWith(refPrefix)) {
      const target = renames.get(node.$ref.slice(refPrefix.length));
      if (target === undefined) {
        throw new Error(`Unknown schema reference ${node.$ref}`);
      }
      node.$ref = refPrefix + target;
    }
  });
}

/** Short name per CLR type; colliding names are qualified with the owning module (`DietFoodResponse`). */
function resolveShortNames(fullNames) {
  const candidates = new Map(fullNames.map((name) => [name, shortName(name, 0)]));

  for (let qualifier = 1; ; qualifier++) {
    const byName = Map.groupBy(fullNames, (name) => candidates.get(name));
    const colliding = [...byName.values()].filter((group) => group.length > 1).flat();
    if (colliding.length === 0) {
      return candidates;
    }
    if (qualifier > 3) {
      throw new Error(`Cannot disambiguate schema names: ${colliding.join(', ')}`);
    }
    for (const name of colliding) {
      candidates.set(name, shortName(name, qualifier));
    }
  }
}

/** `Ns.Type`1[[Ns.Arg, Assembly, ...]]` -> `TypeOfArg`; `qualifier` adds module/namespace segments. */
function shortName(clrName, qualifier) {
  const override = NAME_OVERRIDES.get(clrName);
  if (override !== undefined) {
    return override;
  }
  const generic = /^([^`[]+)`\d+\[(.*)\]$/.exec(clrName);
  if (generic === null) {
    return qualifiedSegments(clrName, qualifier);
  }
  const typeArguments = splitTypeArguments(generic[2]).map((argument) => shortName(argument, qualifier));
  return `${qualifiedSegments(generic[1], 0)}Of${typeArguments.join('And')}`;
}

function qualifiedSegments(typeName, qualifier) {
  const segments = typeName.split('.');
  const typeSegment = segments.at(-1);
  if (qualifier === 0) {
    return typeSegment;
  }
  const moduleIndex = segments.indexOf('Modules');
  const prefix =
    moduleIndex >= 0 && qualifier === 1
      ? [segments[moduleIndex + 1]]
      : segments.slice(-1 - qualifier, -1);
  return [...prefix, typeSegment].join('');
}

/** `[A, Asm, Version=1],[B, Asm]` -> `['A', 'B']` (assembly-qualified names, possibly nested). */
function splitTypeArguments(list) {
  const result = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '[') {
      if (depth === 0) {
        start = i + 1;
      }
      depth++;
    } else if (list[i] === ']') {
      depth--;
      if (depth === 0) {
        result.push(stripAssembly(list.slice(start, i)));
      }
    }
  }
  return result;
}

function stripAssembly(assemblyQualifiedName) {
  let depth = 0;
  for (let i = 0; i < assemblyQualifiedName.length; i++) {
    const char = assemblyQualifiedName[i];
    if (char === '[') depth++;
    else if (char === ']') depth--;
    else if (char === ',' && depth === 0) return assemblyQualifiedName.slice(0, i).trim();
  }
  return assemblyQualifiedName.trim();
}

function assignOperationIds(document) {
  const seen = new Set();
  for (const [path, pathItem] of Object.entries(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation === undefined || operation.operationId) {
        continue;
      }
      const id = method + path.split('/').filter(Boolean).map(pathSegmentName).join('');
      if (seen.has(id)) {
        throw new Error(`Duplicate operationId ${id} (${method.toUpperCase()} ${path})`);
      }
      seen.add(id);
      operation.operationId = id;
    }
  }
}

function pathSegmentName(segment) {
  const parameter = /^\{(.+)\}$/.exec(segment);
  const words = (parameter ? parameter[1] : segment).split(/[^A-Za-z0-9]+/).filter(Boolean);
  return (parameter ? 'By' : '') + words.map(capitalize).join('');
}

function markNonNullablePropertiesRequired(document) {
  for (const schema of Object.values(document.components.schemas)) {
    if (schema.type !== 'object' || schema.properties === undefined) {
      continue;
    }
    const required = Object.entries(schema.properties)
      .filter(([, property]) => property.nullable !== true)
      .map(([name]) => name);
    if (required.length > 0) {
      schema.required = required;
    }
  }
}

function countOperations(document) {
  return Object.values(document.paths)
    .flatMap((pathItem) => HTTP_METHODS.filter((method) => pathItem[method] !== undefined))
    .length;
}

function visit(node, callback) {
  if (Array.isArray(node)) {
    node.forEach((item) => visit(item, callback));
  } else if (node !== null && typeof node === 'object') {
    callback(node);
    Object.values(node).forEach((value) => visit(value, callback));
  }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
