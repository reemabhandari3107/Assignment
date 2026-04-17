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
  @Input({ required: true }) files: DownloadableFile[] = [];

  private readonly selectedPaths = new Set<string>();

  protected get selectedCount(): number {
    return this.getSelectedAvailableFiles().length;
  }

  protected get selectedLabel(): string {
    return this.selectedCount === 0 ? 'None Selected' : `Selected ${this.selectedCount}`;
  }

  protected get allAvailableSelected(): boolean {
    const available = this.getAvailableFiles();
    if (!available.length) {
      return false;
    }
    return available.every((file) => this.selectedPaths.has(file.path));
  }

  protected get someAvailableSelected(): boolean {
    return this.selectedCount > 0 && !this.allAvailableSelected;
  }

  protected isSelected(path: string): boolean {
    return this.selectedPaths.has(path);
  }

  protected onRowSelectionChange(path: string, checked: boolean): void {
    const file = this.files.find((item) => item.path === path);
    if (!file || file.status !== 'available') {
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
    for (const file of this.getAvailableFiles()) {
      this.selectedPaths.add(file.path);
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

  private getAvailableFiles(): DownloadableFile[] {
    return this.files.filter((file) => file.status === 'available');
  }

  private getSelectedAvailableFiles(): DownloadableFile[] {
    return this.files.filter((file) => file.status === 'available' && this.selectedPaths.has(file.path));
  }

  private sanitizeSelection(): void {
    const availablePaths = new Set(this.getAvailableFiles().map((file) => file.path));
    for (const path of this.selectedPaths) {
      if (!availablePaths.has(path)) {
        this.selectedPaths.delete(path);
      }
    }
  }
}
