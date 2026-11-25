import { fireEvent, render, screen } from '@testing-library/react';
import CalendarDialog from './components/CalendarDialog';

it('lets the user browse months and confirms a valid UTC date', () => {
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
  const change = vi.fn();
  render(<CalendarDialog onChange={change} />);
  fireEvent.click(screen.getByRole('button', { name: /تاریخ و ساعت مرجع/ }));
  fireEvent.click(screen.getByRole('button', { name: /⌄/ }));
  fireEvent.click(screen.getByRole('button', { name: 'فروردین' }));
  fireEvent.click(screen.getByRole('button', { name: /^1$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'افزایش دقیقه' }));
  fireEvent.click(screen.getByRole('button', { name: 'تأیید تاریخ و ساعت' }));
  expect(change).toHaveBeenCalledOnce();
  expect(Number.isNaN(Date.parse(change.mock.calls[0][0]))).toBe(false);
});
