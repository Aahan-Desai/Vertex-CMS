type Field = {
  slug: string;
  field_type: string;
  is_required: boolean;
  is_unique: boolean;
  options?: any;
};

type ValidationError = string;

type ValidatorFunction = (
  value: any,
  field: Field
) => ValidationError | null;

// String Validation

const stringValidator: ValidatorFunction = (value, field) => {
  if (typeof value !== "string") {
    return `${field.slug} must be a string`;
  }

  if (
    field.options?.min !== undefined &&
    value.length < field.options.min
  ) {
    return `${field.slug} must be at least ${field.options.min} characters`;
  }

  if (
    field.options?.max !== undefined &&
    value.length > field.options.max
  ) {
    return `${field.slug} must be at most ${field.options.max} characters`;
  }

  return null;
};

// Number Validations

const numberValidator: ValidatorFunction = (value, field) => {
  if (typeof value !== "number") {
    return `${field.slug} must be a number`;
  }

  if (
    field.options?.min !== undefined &&
    value < field.options.min
  ) {
    return `${field.slug} must be >= ${field.options.min}`;
  }

  if (
    field.options?.max !== undefined &&
    value > field.options.max
  ) {
    return `${field.slug} must be <= ${field.options.max}`;
  }

  return null;
};

// Boolean Validation

const booleanValidator: ValidatorFunction = (value, field) => {
  if (typeof value !== "boolean") {
    return `${field.slug} must be a boolean`;
  }

  return null;
};


// Select Validation

const selectValidator: ValidatorFunction = (value, field) => {
  if (!field.options?.values) {
    return `${field.slug} has no defined options`;
  }

  if (!field.options.values.includes(value)) {
    return `${field.slug} must be one of ${field.options.values.join(", ")}`;
  }

  return null;
};

const validators: Record<string, ValidatorFunction> = {
  string: stringValidator,
  number: numberValidator,
  boolean: booleanValidator,
  select: selectValidator,
};

export const validateEntry = (
  entryData: Record<string, any>,
  fields: Field[],
  mode: "create" | "update" = "create"
): string[] | null => {
  const errors: string[] = [];

  const fieldSlugs = fields.map((f) => f.slug);

  for (const key of Object.keys(entryData)) {
    if (!fieldSlugs.includes(key)) {
      errors.push(`${key} is not allowed`);
    }
  }

  for (const field of fields) {
    const value = entryData[field.slug];

    if (
      mode === "create" &&
      field.is_required &&
      value === undefined
    ) {
      errors.push(`${field.slug} is required`);
      continue;
    }

    if (value !== undefined) {
      const validator = validators[field.field_type];

      if (!validator) {
        errors.push(`No validator for field type ${field.field_type}`);
        continue;
      }

      const error = validator(value, field);

      if (error) {
        errors.push(error);
      }
    }
  }

  return errors.length > 0 ? errors : null;
};