import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { StoreBadges } from '../store-badges/store-badges';

const APP_QR_IMAGE = '/images/app-qr.svg';

@Component({
  selector: 'landing-download-section',
  imports: [LandingTranslatePipe, StoreBadges],
  templateUrl: './download-section.html',
  styleUrl: './download-section.css',
})
export class DownloadSection {
  protected readonly sectionId = SITE_SECTIONS.download;
  protected readonly qrImage = APP_QR_IMAGE;
}
