import { isAxiosError } from 'axios';
import type { UseFormSetError, Path } from 'react-hook-form';
import { z } from 'zod';

const FormFieldErrorSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

export function setFormErrors<T extends z.ZodObject>(
  error: unknown,
  schema: T,
  setError: UseFormSetError<z.infer<T>>,
): boolean {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;

  const parsed = FormFieldErrorSchema.safeParse(error.response.data);
  if (!parsed.success) return false;

  for (const [key, value] of Object.entries(parsed.data)) {
    const path = (
      Object.keys(schema.shape).includes(key) ? key : 'root'
    ) as Path<z.infer<T>>;
    setError(path, {
      message: Array.isArray(value) ? value[0] : value,
    });
  }
  return true;
}
