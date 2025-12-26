import type { ZodType } from 'zod/v4'

// =============================================================================
// ZOD SHAPE EXTRACTOR — Converts Zod schemas to simplified JSON shapes
// =============================================================================
//
// Used by catalog generator to export machine-readable schema descriptions.
// Does NOT cover all Zod features — focuses on common patterns.
//
// =============================================================================

/**
 * Simplified property shape for catalog export
 */
export interface PropShape {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'unknown'
  optional: boolean
  default?: string | number | boolean | null
  description?: string
  /** For arrays: shape of array items */
  items?: PropShape
  /** For objects: nested properties */
  properties?: Record<string, PropShape>
}

/**
 * Full schema shape (object with properties)
 */
export interface SchemaShape {
  type: 'object'
  properties: Record<string, PropShape>
}

/**
 * Extract the Zod type name from internal structure
 * Zod v4 uses _zod.def.type or similar internal structures
 */
function getZodTypeName(schema: ZodType): string {
  // Access internal Zod structure
  const def = (schema as unknown as { _zod?: { def?: { type?: string } } })._zod?.def
  if (def?.type) {
    return def.type
  }

  // Fallback: check constructor name
  const name = schema.constructor?.name || ''
  if (name.startsWith('Zod')) {
    return name.replace('Zod', '').toLowerCase()
  }

  return 'unknown'
}

/**
 * Check if schema is optional (wrapped in .optional())
 */
function isOptional(schema: ZodType): boolean {
  const typeName = getZodTypeName(schema)
  return typeName === 'optional' || typeName === 'nullable'
}

/**
 * Get the inner schema if wrapped (optional, nullable, default)
 */
function unwrap(schema: ZodType): ZodType {
  const def = (
    schema as unknown as {
      _zod?: { def?: { type?: string; innerType?: ZodType; value?: unknown } }
    }
  )._zod?.def

  if (def?.type === 'optional' || def?.type === 'nullable' || def?.type === 'default') {
    if (def.innerType) {
      return def.innerType as ZodType
    }
  }

  return schema
}

/**
 * Get default value if schema has one
 */
function getDefault(schema: ZodType): unknown | undefined {
  const def = (schema as unknown as { _zod?: { def?: { type?: string; value?: unknown } } })._zod
    ?.def

  if (def?.type === 'default' && def.value !== undefined) {
    // Only return simple types
    if (
      typeof def.value === 'string' ||
      typeof def.value === 'number' ||
      typeof def.value === 'boolean' ||
      def.value === null
    ) {
      return def.value
    }
  }

  return undefined
}

/**
 * Convert Zod type to simplified type string
 */
function zodToSimpleType(schema: ZodType): PropShape['type'] {
  const unwrapped = unwrap(schema)
  const typeName = getZodTypeName(unwrapped)

  switch (typeName) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return 'array'
    case 'object':
      return 'object'
    default:
      return 'unknown'
  }
}

/**
 * Extract array item schema
 */
function getArrayItemSchema(schema: ZodType): ZodType | null {
  const unwrapped = unwrap(schema)
  const def = (unwrapped as unknown as { _zod?: { def?: { element?: ZodType } } })._zod?.def

  if (def?.element) {
    return def.element as ZodType
  }

  return null
}

/**
 * Extract object properties from Zod object schema
 */
function getObjectShape(schema: ZodType): Record<string, ZodType> | null {
  const unwrapped = unwrap(schema)
  const def = (unwrapped as unknown as { _zod?: { def?: { shape?: Record<string, ZodType> } } })
    ._zod?.def

  if (def?.shape) {
    return def.shape as Record<string, ZodType>
  }

  return null
}

/**
 * Convert a single Zod property to PropShape
 */
function zodToPropShape(schema: ZodType, depth: number = 0): PropShape {
  // Prevent infinite recursion
  if (depth > 5) {
    return { type: 'unknown', optional: false }
  }

  const optional = isOptional(schema)
  const defaultValue = getDefault(schema)
  const simpleType = zodToSimpleType(schema)

  const shape: PropShape = {
    type: simpleType,
    optional: optional || defaultValue !== undefined
  }

  if (defaultValue !== undefined) {
    shape.default = defaultValue as string | number | boolean | null
  }

  // Handle arrays
  if (simpleType === 'array') {
    const itemSchema = getArrayItemSchema(schema)
    if (itemSchema) {
      shape.items = zodToPropShape(itemSchema, depth + 1)
    }
  }

  // Handle nested objects
  if (simpleType === 'object') {
    const objShape = getObjectShape(schema)
    if (objShape) {
      shape.properties = {}
      for (const [key, propSchema] of Object.entries(objShape)) {
        shape.properties[key] = zodToPropShape(propSchema, depth + 1)
      }
    }
  }

  return shape
}

/**
 * Convert a Zod object schema to SchemaShape
 * Main entry point for catalog generation
 *
 * @param schema - Zod schema (expected to be z.object(...))
 * @returns Simplified JSON shape
 */
export function zodToShape(schema: ZodType): SchemaShape {
  const objShape = getObjectShape(schema)

  if (!objShape) {
    // Not an object schema, return empty
    return { type: 'object', properties: {} }
  }

  const properties: Record<string, PropShape> = {}

  for (const [key, propSchema] of Object.entries(objShape)) {
    properties[key] = zodToPropShape(propSchema)
  }

  return {
    type: 'object',
    properties
  }
}
