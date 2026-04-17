import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type FileStatus = 'available' | 'scheduled';

export interface DownloadableFile {
  name: string;
  device: string;
  path: string;
  status: FileStatus;
}

@Component({
  selector: 'app-downloadable-files-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './downloadable-files-table.component.html',
  styleUrl: './downloadable-files-table.component.css',
})
export class DownloadableFilesTableComponent {
  private allFiles: DownloadableFile[] = [];
  private availableFiles: DownloadableFile[] = [];
  private availablePaths = new Set<string>();

  @Input({ required: true })
  set files(value: DownloadableFile[]) {
    this.allFiles = value ?? [];
    this.availableFiles = this.allFiles.filter((file) => file.status === 'available');
    this.availablePaths = new Set(this.availableFiles.map((file) => file.path));
    this.sanitizeSelection();
  }

  get files(): DownloadableFile[] {
    return this.allFiles;
  }

  private readonly selectedPaths = new Set<string>();

  protected get selectedCount(): number {
    let count = 0;
    for (const path of this.selectedPaths) {
      if (this.availablePaths.has(path)) {
        count++;
      }
    }
    return count;
  }

  protected get selectedLabel(): string {
    return this.selectedCount === 0 ? 'None Selected' : `Selected ${this.selectedCount}`;
  }

  protected get allAvailableSelected(): boolean {
    if (this.availablePaths.size === 0) {
      return false;
    }
    return this.selectedCount === this.availablePaths.size;
  }

  protected get someAvailableSelected(): boolean {
    return this.selectedCount > 0 && !this.allAvailableSelected;
  }

  protected isSelected(path: string): boolean {
    return this.selectedPaths.has(path);
  }

  protected onRowSelectionChange(path: string, checked: boolean): void {
    if (!this.availablePaths.has(path)) {
      this.selectedPaths.delete(path);
      return;
    }

    if (checked) {
      this.selectedPaths.add(path);
    } else {
      this.selectedPaths.delete(path);
    }
  }

  protected toggleSelectAll(): void {
    if (this.allAvailableSelected) {
      this.selectedPaths.clear();
      return;
    }

    this.selectedPaths.clear();
    for (const path of this.availablePaths) {
      this.selectedPaths.add(path);
    }
  }

  protected downloadSelected(): void {
    this.sanitizeSelection();
    const selected = this.getSelectedAvailableFiles();

    if (selected.length === 0) {
      return;
    }

    const message = selected.map((file) => `${file.device} ${file.path}`).join('\n');

    window.alert(message);
  }

  protected formatStatus(status: FileStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  private getSelectedAvailableFiles(): DownloadableFile[] {
    return this.availableFiles.filter((file) => this.selectedPaths.has(file.path));
  }

  private sanitizeSelection(): void {
    for (const path of this.selectedPaths) {
      if (!this.availablePaths.has(path)) {
        this.selectedPaths.delete(path);
      }
    }
  }
}
