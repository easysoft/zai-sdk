import {describe, expect, it} from 'vitest';
import {loadSpecification, mergeSpecifications, resolveSchema, specificationForTypes, typeName, type Specification} from '../scripts/openapi.js';
import {operations, validateOperationMappings, type OperationMapping} from '../scripts/operations.js';

const spec = await loadSpecification();

describe('OpenAPI generation safeguards', () => {
  it('resolves local references and preserves sibling annotations without changing the input', () => {
    const schema = {$ref: '#/components/schemas/FileExtractRequest', description: 'local note'};
    expect(resolveSchema(schema, spec)).toMatchObject({description: 'local note', properties: {file: {format: 'binary'}}});
    expect(schema).toEqual({$ref: '#/components/schemas/FileExtractRequest', description: 'local note'});
    expect(resolveSchema(undefined, spec)).toEqual({});
  });

  it('handles escaped JSON pointers and rejects missing, remote, and circular references', () => {
    const custom: Specification = {...spec, components: {schemas: {'a/b~c': {type: 'string'}, loop: {$ref: '#/components/schemas/loop'}}}};
    expect(resolveSchema({$ref: '#/components/schemas/a~1b~0c'}, custom)).toEqual({type: 'string'});
    for (const ref of ['#/components/schemas/missing', 'https://example.test/schema', '#/components/schemas/loop']) expect(() => resolveSchema({$ref: ref}, custom)).toThrow();
  });

  it('rejects supplementary paths that overlap the original contract', () => {
    expect(() => mergeSpecifications(spec, {paths: {'/agents': {}}})).toThrow('Supplement duplicates existing paths');
  });

  it('accepts an empty supplement after upstream adopts its operations', () => {
    expect(mergeSpecifications(spec, {paths: {}})).toEqual(spec);
    expect(() => mergeSpecifications(spec, {paths: {'/coding/sessions/{session_id}/stream': {}}}))
      .toThrow('Supplement duplicates existing paths');
  });

  it('expands attachment requirements on a type-generation copy without changing the contract', () => {
    const normalized = specificationForTypes(spec);
    const items = (input: Specification) => input.paths['/sessions/{session_id}/messages']!.post!.requestBody!.content['application/json']!.schema.properties!.content!.items!.oneOf!;
    for (const [index, type] of [[1, 'input_image'], [2, 'input_file']] as const) {
      expect(items(spec)[index]!.anyOf).toEqual([{required: ['file_id']}, {required: ['path']}]);
      expect(items(normalized)[index]).not.toHaveProperty('properties');
      expect(items(normalized)[index]!.anyOf).toEqual([
        expect.objectContaining({type: 'object', properties: expect.objectContaining({type: {type: 'string', enum: [type]}}), required: ['type', 'file_id']}),
        expect.objectContaining({type: 'object', properties: expect.objectContaining({type: {type: 'string', enum: [type]}}), required: ['type', 'path']}),
      ]);
    }
    expect(specificationForTypes({...spec, paths: {}}).paths).toEqual({});
  });

  it('rejects missing, duplicate, and unclassified operations and public namespace collisions', () => {
    expect(() => validateOperationMappings(spec)).not.toThrow();
    expect(() => validateOperationMappings(spec, operations.slice(1))).toThrow('Operation mapping mismatch');
    expect(() => validateOperationMappings(spec, [...operations, operations[0]])).toThrow('Operation mapping mismatch');
    const changed = (index: number, values: Partial<Record<number, unknown>>) => operations.map((operation, i) => i === index ? Object.assign([...operation], values) as unknown as OperationMapping : operation);
    expect(() => validateOperationMappings(spec, changed(0, {4: undefined}))).toThrow('Missing authorization');
    expect(() => validateOperationMappings(spec, changed(0, {5: ''}))).toThrow('Missing authorization');
    expect(() => validateOperationMappings(spec, changed(0, {0: 'agents', 1: 'create'}))).toThrow('Duplicate public method');
    expect(() => validateOperationMappings(spec, changed(0, {0: 'agents.create', 1: 'child'}))).toThrow('namespace');
    expect(() => validateOperationMappings(spec, changed(0, {0: 'invalid-name'}))).toThrow('Invalid public method');
    expect(() => validateOperationMappings(spec, changed(0, {6: 'create'}))).toThrow('Duplicate public method');
  });

  it('generates unambiguous nested type names', () => {
    expect(typeName('coding.sessions', 'create')).toBe('CodingSessionsCreate');
    expect(typeName('chat.messages', 'send')).toBe('ChatMessagesSend');
    expect(() => validateOperationMappings(spec, operations.map((operation, i) => i === 0 ? ['a.b', 'c', ...operation.slice(2)] as unknown as OperationMapping : i === 1 ? ['a', 'bC', ...operation.slice(2)] as unknown as OperationMapping : operation))).toThrow('generated type');
  });
});
