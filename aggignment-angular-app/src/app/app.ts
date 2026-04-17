import { Component } from '@angular/core';
import {
  DownloadableFile,
  DownloadableFilesTableComponent,
} from './shared/downloadable-files-folder/downloadable-files-table.component';

@Component({
  selector: 'app-root',
  imports: [DownloadableFilesTableComponent],
  template: `
    <main class="page">
      <app-downloadable-files-table [files]="files"></app-downloadable-files-table>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .page {
        max-width: 1100px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
    `,
  ],
})
export class App {
  protected readonly files: DownloadableFile[] = [
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
    {
      name: 'cryptbase.dll',
      device: 'Martell',
      path: '\\Device\\HarddiskVolume1\\Windows\\System32\\cryptbase.dll',
      status: 'scheduled',
    },
    {
      name: '7za.exe',
      device: 'Baratheon',
      path: '\\Device\\HarddiskVolume1\\temp\\7za.exe',
      status: 'scheduled',
    },
  ];
}
