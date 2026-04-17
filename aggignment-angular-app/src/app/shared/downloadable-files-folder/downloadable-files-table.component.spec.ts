import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DownloadableFile,
  DownloadableFilesTableComponent,
} from './downloadable-files-table.component';

function mockAlert() {
  const calls: string[] = [];
  const originalAlert = window.alert;

  window.alert = ((message?: unknown) => {
    calls.push(String(message ?? ''));
  }) as typeof window.alert;

  return {
    calls,
    restore() {
      window.alert = originalAlert;
    },
  };
}

describe('DownloadableFilesTableComponent', () => {
  let fixture: ComponentFixture<DownloadableFilesTableComponent>;
  let component: DownloadableFilesTableComponent;

  const files: DownloadableFile[] = [
    {
      name: 'smss.exe',
      device: 'Stark',
      path: '\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe',
      status: 'scheduled',
    },
    {
      name: 'netsh.exe',
      device: 'Targaryen',
      path: '\\Device\\HarddiskVolume2\\Windows\\System32\\netsh.exe',
      status: 'available',
    },
    {
      name: 'uxtheme.dll',
      device: 'Lanniester',
      path: '\\Device\\HarddiskVolume1\\Windows\\System32\\uxtheme.dll',
      status: 'available',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadableFilesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadableFilesTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('files', files);
    fixture.detectChanges();
  });

  it('shows "None Selected" by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    expect(compiled.textContent).toContain('None Selected');
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(false);
  });

  it('selects only available rows when select-all is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    selectAll.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Selected 2');
    expect(component['allAvailableSelected']).toBe(true);
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
  });

  it('shows select-all as indeterminate on partial selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rowCheckboxes = compiled.querySelectorAll('.list-row input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    rowCheckboxes[1].click();
    fixture.detectChanges();

    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);
    expect(component['allAvailableSelected']).toBe(false);
  });

  it('clears all selections when select-all is clicked again', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    selectAll.click();
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Selected 2');

    selectAll.click();
    fixture.detectChanges();
    expect(compiled.textContent).toContain('None Selected');
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(false);
  });

  it('formats status labels with capitalization', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statusChips = Array.from(compiled.querySelectorAll('.status-chip')).map((item) =>
      item.textContent?.trim(),
    );

    expect(statusChips).toContain('Scheduled');
    expect(statusChips).toContain('Available');
  });

  it('alerts selected file details on download', () => {
    const alertSpy = mockAlert();
    const compiled = fixture.nativeElement as HTMLElement;
    const rowCheckboxes = compiled.querySelectorAll('.list-row input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const button = compiled.querySelector('button') as HTMLButtonElement;

    rowCheckboxes[1].click();
    fixture.detectChanges();
    button.click();

    expect(alertSpy.calls).toEqual(['Targaryen \\Device\\HarddiskVolume2\\Windows\\System32\\netsh.exe']);
    alertSpy.restore();
  });

  it('alerts all selected file details when download selected is clicked', () => {
    const alertSpy = mockAlert();
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;
    const button = compiled.querySelector('button') as HTMLButtonElement;

    selectAll.click();
    fixture.detectChanges();
    button.click();

    expect(alertSpy.calls).toEqual([
      'Targaryen \\Device\\HarddiskVolume2\\Windows\\System32\\netsh.exe\nLanniester \\Device\\HarddiskVolume1\\Windows\\System32\\uxtheme.dll',
    ]);
    alertSpy.restore();
  });

  it('adds the selected row class when an available row is checked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('.list-row');
    const rowCheckboxes = compiled.querySelectorAll('.list-row input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const selectedDataRow = rows[2] as HTMLElement;

    rowCheckboxes[1].click();
    fixture.detectChanges();

    expect(selectedDataRow.classList.contains('row-selected')).toBe(true);
  });

  it('ignores restricted rows during download', () => {
    const alertSpy = mockAlert();

    component['selectedPaths'].add('\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe');
    (component as any).downloadSelected();

    expect(alertSpy.calls).toHaveLength(0);
    expect(component['selectedPaths'].has('\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe')).toBe(
      false,
    );
    alertSpy.restore();
  });
});
