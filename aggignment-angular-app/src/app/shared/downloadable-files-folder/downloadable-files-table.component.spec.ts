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

  it('shows none selected by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    expect(compiled.textContent).toContain('None Selected');
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(false);
  });

  it('select-all selects only available rows', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    selectAll.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Selected 2');
    expect(component['allAvailableSelected']).toBe(true);
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
  });

  it('sets select-all indeterminate for partial selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rowCheckboxes = compiled.querySelectorAll('.list-row input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    rowCheckboxes[1].click();
    fixture.detectChanges();

    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);
    expect(component['allAvailableSelected']).toBe(false);
  });

  it('alerts selected available files on download', () => {
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

  it('ignores restricted selections when download is triggered', () => {
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
