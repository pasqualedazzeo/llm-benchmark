import { describe, it, expect } from 'vitest';
import { extractVariablesFromString, substituteVariables, detectDuplicateVariables } from './prompt-utils';

describe('extractVariablesFromString', () => {
  it('should return an empty array for null or empty content', () => {
    expect(extractVariablesFromString('')).toEqual([]);
    // @ts-expect-error testing invalid input
    expect(extractVariablesFromString(null)).toEqual([]);
    // @ts-expect-error testing invalid input
    expect(extractVariablesFromString(undefined)).toEqual([]);
  });

  it('should return an empty array if no variables are found', () => {
    expect(extractVariablesFromString('Hello world without variables.')).toEqual([]);
  });

  it('should extract a single variable', () => {
    expect(extractVariablesFromString('Hello {{name}}!')).toEqual(['name']);
  });

  it('should extract multiple variables', () => {
    expect(extractVariablesFromString('{{greeting}}, {{name}}! Welcome to {{place}}.')).toEqual([
      'greeting',
      'name',
      'place',
    ]);
  });

  it('should handle variables with spaces around them', () => {
    expect(extractVariablesFromString('Hello {{  spacedName  }}!')).toEqual(['spacedName']);
  });

  it('should extract variables with numbers and underscores', () => {
    expect(extractVariablesFromString('Variable {{var_1}} and {{var2_test_3}}.')).toEqual([
      'var_1',
      'var2_test_3',
    ]);
  });

  it('should extract variables in ALL_CAPS', () => {
    expect(extractVariablesFromString('This is {{IMPORTANT_VAR}}.')).toEqual(['IMPORTANT_VAR']);
  });

  it('should return unique variable names, preserving first encountered order (though order is not guaranteed by Set)', () => {
    const result = extractVariablesFromString('{{name}} {{name}} {{another}} {{name}} {{another}}');
    expect(result).toHaveLength(2);
    expect(result).toContain('name');
    expect(result).toContain('another');
  });

  it('should not extract variables with spaces in their names (due to \\w+)', () => {
    expect(extractVariablesFromString('Hello {{invalid name}} and {{valid_name}}.')).toEqual(['valid_name']);
  });

  it('should not extract incomplete variable placeholders', () => {
    expect(extractVariablesFromString('Hello {{name and {{another}}.')).toEqual(['another']);
    expect(extractVariablesFromString('Hello {{ name }}.')).toEqual(['name']);
    expect(extractVariablesFromString('Hello {name}}.')).toEqual([]);
    expect(extractVariablesFromString('Hello {{name.')).toEqual([]);
  });
  
  it('should not extract empty variable names {{}}', () => {
    expect(extractVariablesFromString('Hello {{}}!')).toEqual([]);
  });

  it('should handle mixed content', () => {
    expect(extractVariablesFromString('Prefix {{var1}} infix {{var2}} suffix')).toEqual(['var1', 'var2']);
  });
});

describe('substituteVariables', () => {
  it('should return an empty string for null or empty template', () => {
    expect(substituteVariables('', {})).toBe('');
    // @ts-expect-error testing invalid input
    expect(substituteVariables(null, {})).toBe('');
     // @ts-expect-error testing invalid input
    expect(substituteVariables(undefined, {})).toBe('');
  });

  it('should substitute a single variable', () => {
    expect(substituteVariables('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');
  });

  it('should substitute multiple variables', () => {
    const template = '{{greeting}}, {{name}}! Welcome to {{place}}.';
    const values = { greeting: 'Hi', name: 'Alice', place: 'Wonderland' };
    expect(substituteVariables(template, values)).toBe('Hi, Alice! Welcome to Wonderland.');
  });

  it('should handle variables with spaces in definition but not in value lookup', () => {
    expect(substituteVariables('Hello {{  spacedName  }}!', { spacedName: 'Trimmed' })).toBe('Hello Trimmed!');
  });

  it('should substitute variables with numbers and underscores', () => {
    const template = 'Values: {{var_1}}, {{var2_test_3}}.';
    const values = { var_1: 'one', var2_test_3: 'two' };
    expect(substituteVariables(template, values)).toBe('Values: one, two.');
  });

  it('should substitute variables in ALL_CAPS', () => {
    expect(substituteVariables('Important: {{IMPORTANT_VAR}}.', { IMPORTANT_VAR: 'Critical' })).toBe(
      'Important: Critical.'
    );
  });

  it('should replace a variable with an empty string if its value is empty', () => {
    expect(substituteVariables('Hello {{name}}!', { name: '' })).toBe('Hello !');
  });
  
  it('should replace a variable with an empty string if its value is null or undefined', () => {
    // @ts-expect-error testing invalid input
    expect(substituteVariables('Test: {{val1}}, {{val2}}', { val1: null, val2: undefined })).toBe('Test: , ');
  });

  it('should leave variables as is if they are not in the values object', () => {
    expect(substituteVariables('Hello {{name}} and {{missing}}!', { name: 'User' })).toBe(
      'Hello User and {{missing}}!'
    );
  });

  it('should ignore extra keys in the values object not present in the template', () => {
    expect(substituteVariables('Hello {{name}}!', { name: 'User', extra: 'ignored' })).toBe('Hello User!');
  });

  it('should return the template as is if no variables are in it', () => {
    expect(substituteVariables('Hello World!', { name: 'User' })).toBe('Hello World!');
  });

  it('should return the template as is if values object is empty', () => {
    expect(substituteVariables('Hello {{name}}!', {})).toBe('Hello {{name}}!');
  });
  
  it('should handle repeated variables correctly', () => {
    expect(substituteVariables('{{name}} {{name}}', { name: 'Test' })).toBe('Test Test');
  });
  
  it('should handle complex template with multiple occurrences and different variables', () => {
    const template = '{{header}} User: {{user_id}}. Action: {{action}}. User: {{user_id}} again.';
    const values = { header: 'Log:', user_id: '123', action: 'login' };
    expect(substituteVariables(template, values)).toBe('Log: User: 123. Action: login. User: 123 again.');
  });
});
