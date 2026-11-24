import { useForm, type SubmitHandler } from 'react-hook-form';

interface Props {
  onSubmit: (file: File, now?: string) => void;
  loading: boolean;
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ file: FileList; now: string }>({ mode: 'onBlur' });

  const submit: SubmitHandler<{ file: FileList; now: string }> = ({ file, now }) => onSubmit(file[0], now ? `${now}:00Z` : undefined);

  return (
    <form className="card upload" onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor="file">
        فایل خروجی CSV
        <input id="file" data-testid="upload-input" type="file" accept=".csv,text/csv" aria-invalid={Boolean(errors.file)} {...register('file', { required: 'یک فایل CSV انتخاب کنید.', validate: (files) => files?.[0]?.name.toLowerCase().endsWith('.csv') || 'فرمت فایل باید CSV باشد.' })} />
      </label>
      {errors.file && <p className="field-error" role="alert">{errors.file.message}</p>}
      <label htmlFor="now">
        زمان مرجع (UTC، اختیاری)
        <input id="now" type="datetime-local" {...register('now')} />
      </label>
      <button type="submit" data-testid="analyze-button" disabled={loading}>
        {loading ? 'در حال تحلیل…' : 'تحلیل فایل'}
      </button>
    </form>
  );
}
