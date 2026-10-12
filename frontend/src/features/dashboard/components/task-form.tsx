import { Button } from '@/components/shadcn/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// 扩展方式：在 schema 中加字段，并在下方增加对应的 Controller 块
const taskFormSchema = z.object({
  name: z.string().min(1, '请输入任务名称').max(200, '名称过长'),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function TaskForm({
  formId,
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  formId: string;
  defaultValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  submitLabel: string;
}) {
  const { control, handleSubmit } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-name`}>名称</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id={`${formId}-name`}
                placeholder="请输入任务名称"
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" form={formId}>
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
