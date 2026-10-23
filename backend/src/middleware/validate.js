import { ValidationError } from '../utils/errors.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new ValidationError('Request validation failed', details));
      }
      next(err);
    }
  };
}
