import { useRef, useState, type DragEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

interface Props {
  onSubmit: (file: File, now?: string) => void;
  loading: boolean;
}

export default function UploadForm({ onSubmit, loading }: Props) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{ file: FileList; nowDate: string; nowTime: string }>({ mode: 'onBlur' });
  const fileField = register('file', { required: 'یک فایل CSV انتخاب کنید.', validate: (files) => files?.[0]?.name.toLowerCase().endsWith('.csv') || 'فرمت فایل باید CSV باشد.' });
  const selectedFile = watch('file')?.[0];

  const submit: SubmitHandler<{ file: FileList; nowDate: string; nowTime: string }> = ({ file, nowDate, nowTime }) => onSubmit(file[0], nowDate && nowTime ? `${nowDate}T${nowTime}:00Z` : undefined);
  function acceptFile(files: FileList | null) { if (files?.[0]) setValue('file', files, { shouldValidate: true, shouldTouch: true }); }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files); }

  return (
    <form className="card upload" onSubmit={handleSubmit(submit)} noValidate>
      <div className={dragging ? 'dropzone is-dragging' : 'dropzone'} role="button" tabIndex={0} aria-label="انتخاب فایل CSV" onClick={() => fileInput.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInput.current?.click(); }} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input id="file" data-testid="upload-input" className="visually-hidden" type="file" accept=".csv,text/csv" aria-invalid={Boolean(errors.file)} {...fileField} ref={(element) => { fileField.ref(element); fileInput.current = element; }} onChange={(event) => { fileField.onChange(event); acceptFile(event.target.files); }} />
        <span className="upload-icon" aria-hidden="true">↑</span><strong>{selectedFile ? selectedFile.name : 'فایل CSV را اینجا رها کنید'}</strong><span>{selectedFile ? `${Math.ceil(selectedFile.size / 1024).toLocaleString('fa-IR')} کیلوبایت` : 'یا برای انتخاب فایل کلیک کنید'}</span>
      </div>
      {errors.file && <p className="field-error" role="alert">{errors.file.message}</p>}
      <fieldset className="reference-time"><legend>زمان مرجع <small>(اختیاری، UTC)</small></legend><div><label htmlFor="now-date">تاریخ</label><input id="now-date" inputMode="numeric" placeholder="2026-10-26" aria-describedby="time-hint" {...register('nowDate', { pattern: { value: /^$|^\d{4}-\d{2}-\d{2}$/, message: 'تاریخ را با قالب YYYY-MM-DD وارد کنید.' } })} /></div><div><label htmlFor="now-time">ساعت</label><input id="now-time" inputMode="numeric" placeholder="10:30" {...register('nowTime', { pattern: { value: /^$|^\d{2}:\d{2}$/, message: 'ساعت را با قالب HH:MM وارد کنید.' } })} /></div><p id="time-hint">در صورت خالی بودن، زمان فعلی مرورگر استفاده می‌شود.</p></fieldset>
      {(errors.nowDate || errors.nowTime) && <p className="field-error" role="alert">{errors.nowDate?.message || errors.nowTime?.message}</p>}
      <button type="submit" data-testid="analyze-button" disabled={loading}>
        {loading ? 'در حال تحلیل…' : 'تحلیل فایل'}
      </button>
    </form>
  );
}
