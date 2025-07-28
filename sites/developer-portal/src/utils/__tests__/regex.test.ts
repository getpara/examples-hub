import { APPLE_BUNDLE_IDENTIFIER_REGEX } from '../regex';

describe('APPLE_BUNDLE_IDENTIFIER_REGEX', () => {
  it('should validate standard bundle identifiers', () => {
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('com.example.app')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('com.company.myapp')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('org.example.test')).toBe(true);
  });

  it('should validate bundle identifiers starting with numbers', () => {
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('ai.375.375go')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('123.456.789')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('ai.123.app')).toBe(true);
  });

  it('should validate bundle identifiers with hyphens', () => {
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('com.capsule.swift-example')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('ai.company-name.app')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('123-abc.456-def.789-ghi')).toBe(true);
  });

  it('should reject invalid bundle identifiers', () => {
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('singleword')).toBe(false);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('com.example.')).toBe(false);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('.com.example')).toBe(false);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('com..example')).toBe(false);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('')).toBe(false);
  });

  it('should validate mixed case bundle identifiers', () => {
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('Com.Example.App')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('AI.375.375GO')).toBe(true);
    expect(APPLE_BUNDLE_IDENTIFIER_REGEX.test('myCompany.myApp.v2')).toBe(true);
  });
});
