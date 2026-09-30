import {readFile} from 'node:fs/promises';

export interface Schema {
  $ref?: string;
  type?: string | string[];
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  oneOf?: Schema[];
  anyOf?: Schema[];
  allOf?: Schema[];
  enum?: unknown[];
  example?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  minLength?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  additionalProperties?: boolean | Schema;
  [key: string]: unknown;
}
export interface Parameter {name: string; in: string; required?: boolean; description?: string; schema?: Schema}
export interface Operation {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: {required?: boolean; content: Record<string, {schema: Schema}>};
  responses: Record<string, {description?: string; content?: Record<string, {schema?: Schema}>}>;
}
export interface Specification {
  openapi: string;
  info: {title: string; version: string};
  paths: Record<string, Record<string, Operation>>;
  components?: {schemas?: Record<string, Schema>};
}

/** Supplement paths are additions, never overrides of the server's contract. */
export function mergeSpecifications(spec: Specification, supplement: Pick<Specification, 'paths'>): Specification {
  const duplicates = Object.keys(supplement.paths).filter(path => path in spec.paths);
  if (duplicates.length) throw new Error(`Supplement duplicates existing paths: ${duplicates.join(', ')}`);
  return {...spec, paths: {...spec.paths, ...supplement.paths}};
}

export async function loadSpecification(): Promise<Specification> {
  const [original, supplement] = await Promise.all(['../zai-openapi.json', '../zai-openapi.supplement.json'].map(async path =>
    JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8')) as Specification,
  ));
  return mergeSpecifications(original!, supplement!);
}

/** Resolve a local reference at this node; children remain lazy to support recursive schemas. */
export function resolveSchema(schema: Schema | undefined, spec: Specification): Schema {
  let resolved = schema ?? {};
  const visited = new Set<string>();
  while (resolved.$ref) {
    const {$ref, ...siblings} = resolved;
    if (!$ref.startsWith('#/') || visited.has($ref)) throw new Error(`Unsupported or circular schema reference: ${$ref}`);
    visited.add($ref);
    let target: unknown = spec;
    for (const part of $ref.slice(2).split('/')) {
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      target = target && typeof target === 'object' ? (target as Record<string, unknown>)[key] : undefined;
    }
    if (!target || typeof target !== 'object' || Array.isArray(target)) throw new Error(`Missing schema reference: ${$ref}`);
    resolved = {...target as Schema, ...siblings};
  }
  return resolved;
}

export function typeName(group: string, name: string): string {
  return [...group.split('.'), name].map(part => part[0]!.toUpperCase() + part.slice(1)).join('');
}
