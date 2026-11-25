import { fireEvent, render, screen } from '@testing-library/react';
import UploadForm from './components/UploadForm';

it('starts analysis on CSV selection with a valid reference timestamp', () => {
  const submit = vi.fn();
  render(<UploadForm loading={false} onSubmit={submit} />);
  const file = new File(['message_id,body\nM1,hello'], 'eval_messages.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('upload-input'), { target: { files: [file] } });
  expect(submit).toHaveBeenCalledOnce();
  expect(submit.mock.calls[0][0]).toBe(file);
  expect(Number.isNaN(Date.parse(submit.mock.calls[0][1]))).toBe(false);
});
