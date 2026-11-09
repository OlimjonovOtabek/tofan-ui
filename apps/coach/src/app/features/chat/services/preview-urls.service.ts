import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreviewUrls {
  create(file: File): string | null {
    return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null;
  }

  revoke(url: string | null): void {
    if (url !== null && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url);
    }
  }
}
