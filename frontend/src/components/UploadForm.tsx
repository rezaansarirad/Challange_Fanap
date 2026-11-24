import { useState, type DragEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import JalaliDatePicker from './JalaliDatePicker';

interface Props {
  onSubmit: (file: File, now?: string) => void;
  loading: boolean;
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{ file: FileList; now: string }>({ mode: 'onBlur', defaultValues: { now: new Date().toISOString() } });
  const fileField = register('file', { required: 'یک فایل CSV انتخاب کنید.', validate: (files) => files?.[0]?.name.toLowerCase().endsWith('.csv') || 'فرمت فایل باید CSV باشد.' });
  const selectedFile = watch('file')?.[0];

  const submit: SubmitHandler<{ file: FileList; now: string }> = ({ file, now }) => onSubmit(file[0], now ? `${now}:00Z` : undefined);
  function acceptFile(files: FileList | null) { if (files?.[0]) setValue('file', files, { shouldValidate: true, shouldTouch: true }); }
  function onDrop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files); }

  return (
    <form className="card upload" onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor="file" className={dragging ? 'dropzone is-dragging' : 'dropzone'} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input id="file" data-testid="upload-input" className="visually-hidden" type="file" accept=".csv,text/csv" aria-invalid={Boolean(errors.file)} {...fileField} onChange={(event) => { fileField.onChange(event); acceptFile(event.target.files); }} />
        <span className="upload-icon" aria-hidden="true">↑</span><strong>{selectedFile ? selectedFile.name : 'فایل CSV را اینجا رها کنید'}</strong><span>{selectedFile ? `${Math.ceil(selectedFile.size / 1024).toLocaleString('fa-IR')} کیلوبایت` : 'یا برای انتخاب فایل کلیک کنید'}</span>
      </label>
      {errors.file && <p className="field-error" role="alert">{errors.file.message}</p>}
      <div className="calendar-field"><input type="hidden" {...register('now')} /><JalaliDatePicker onChange={(value) => setValue('now', value)} /><p>زمان انتخاب‌شده به وقت تهران و با تقویم جلالی است.</p></div>
      <button type="submit" data-testid="analyze-button" disabled={loading}>
        {loading ? 'در حال تحلیل…' : 'تحلیل فایل'}
      </button>
    </form>
  );
}
