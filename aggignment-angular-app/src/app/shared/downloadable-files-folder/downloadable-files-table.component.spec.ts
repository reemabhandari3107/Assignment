import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DownloadableFile,
  DownloadableFilesTableComponent,
} from './downloadable-files-table.component';

function mockAlert() {
  const testGlobals = globalThis as any;

  if (testGlobals.jest) {
    return testGlobals.jest.spyOn(window, 'alert').mockImplementation(() => {});
  }

  if (testGlobals.vi) {
    return testGlobals.vi.spyOn(window, 'alert').mockImplementation(() => {});
  }

  return spyOn(window, 'alert');
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
    expect(compiled.textContent).toContain('None Selected');
  });

  it('select-all selects only available rows', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    selectAll.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Selected 2');
    expect(component['allAvailableSelected']).toBe(true);
  });

  it('sets select-all indeterminate for partial selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const rowCheckboxes = compiled.querySelectorAll('.list-row input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
    const selectAll = compiled.querySelector('.toolbar input[type="checkbox"]') as HTMLInputElement;

    rowCheckboxes[1].click();
    fixture.detectChanges();

    expect(selectAll.indeterminate).toBe(true);
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

    expect(alertSpy).toHaveBeenCalledWith(
      'Targaryen \\Device\\HarddiskVolume2\\Windows\\System32\\netsh.exe',
    );

    if ('mockRestore' in alertSpy) {
      alertSpy.mockRestore();
    }
  });

  it('ignores restricted selections when download is triggered', () => {
    const alertSpy = mockAlert();

    component['selectedPaths'].add('\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe');
    (component as any).downloadSelected();

    expect(alertSpy).not.toHaveBeenCalled();
    expect(component['selectedPaths'].has('\\Device\\HarddiskVolume2\\Windows\\System32\\smss.exe')).toBe(
      false,
    );

    if ('mockRestore' in alertSpy) {
      alertSpy.mockRestore();
    }
  });
});
