import { useState, type DragEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import JalaliDatePicker from './CalendarDialog';

interface Props {
  onSubmit: (file: File, now?: string) => void;
  loading: boolean;
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{ file: File | null; now: string }>({ mode: 'onSubmit', defaultValues: { file: null, now: new Date().toISOString() } });
  register('file', { validate: (file) => !file ? 'یک فایل CSV انتخاب کنید.' : file.name.toLowerCase().endsWith('.csv') || 'فرمت فایل باید CSV باشد.' });
  const selectedFile = watch('file');

  const submit: SubmitHandler<{ file: File | null; now: string }> = ({ file, now }) => { if (file) onSubmit(file, now || new Date().toISOString()); };
  function acceptFile(files: FileList | null) {
    const file = files?.[0];
    if (!file || loading) return;
    setValue('file', file, { shouldValidate: true, shouldTouch: true });
  }
  function onDrop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files); }

  return (
    <form className="card upload" onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor="file" className={dragging ? 'dropzone is-dragging' : 'dropzone'} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input id="file" data-testid="upload-input" className="visually-hidden" type="file" accept=".csv,text/csv" disabled={loading} aria-invalid={Boolean(errors.file)} onChange={(event) => acceptFile(event.target.files)} />
        <span className="upload-icon" aria-hidden="true">↑</span><strong>{selectedFile ? selectedFile.name : 'فایل CSV را اینجا رها کنید'}</strong><span>{selectedFile ? `${Math.ceil(selectedFile.size / 1024).toLocaleString('fa-IR')} کیلوبایت` : 'یا برای انتخاب فایل کلیک کنید'}</span>
      </label>
      {errors.file && <p className="field-error" role="alert">{errors.file.message}</p>}
      <div className="calendar-field"><input type="hidden" {...register('now')} /><JalaliDatePicker onChange={(value) => setValue('now', value)} /><p>زمان انتخاب‌شده به وقت تهران و با تقویم جلالی است.</p></div>
      {loading && <p role="status">فایل در حال بارگذاری و تحلیل است…</p>}
      <button type="submit" data-testid="analyze-button" disabled={loading}>
        {loading ? 'در حال تحلیل…' : 'تحلیل فایل'}
      </button>
    </form>
  );
}
