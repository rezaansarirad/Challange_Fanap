import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UploadForm from './components/UploadForm';

it('submits the selected CSV only after clicking analyze without a false required error', async () => {
  const submit = vi.fn();
  render(<UploadForm loading={false} onSubmit={submit} />);
  const file = new File(['message_id,body\nM1,hello'], 'eval_messages.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('upload-input'), { target: { files: [file] } });
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByTestId('analyze-button'));
  await waitFor(() => expect(submit).toHaveBeenCalledOnce());
  expect(screen.queryByText('یک فایل CSV انتخاب کنید.')).not.toBeInTheDocument();
  expect(submit.mock.calls[0][0]).toBe(file);
  expect(Number.isNaN(Date.parse(submit.mock.calls[0][1]))).toBe(false);
});
