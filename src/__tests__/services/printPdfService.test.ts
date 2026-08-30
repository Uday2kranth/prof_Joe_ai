// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrintCustomConfig,
  savePrintCustomConfig,
  buildPrintHtmlDocument,
  DEFAULT_PRINT_CONFIG
} from '../../services/printPdfService';

describe('Print PDF Service & Page Numbering Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have showPageNumbers set to true by default', () => {
    const config = getPrintCustomConfig();
    expect(config.showPageNumbers).toBe(true);
    expect(DEFAULT_PRINT_CONFIG.showPageNumbers).toBe(true);
  });

  it('should allow toggling showPageNumbers via savePrintCustomConfig', () => {
    savePrintCustomConfig({ showPageNumbers: false });
    expect(getPrintCustomConfig().showPageNumbers).toBe(false);

    savePrintCustomConfig({ showPageNumbers: true });
    expect(getPrintCustomConfig().showPageNumbers).toBe(true);
  });

  it('should render single page counter dock in buildPrintHtmlDocument without duplicate @bottom-right rule', () => {
    savePrintCustomConfig({ showPageNumbers: true, showFooter: false });
    const html = buildPrintHtmlDocument('Test Document', '<p>Test Content</p>', '#ffffff', '#000000');

    // Should NOT have duplicate @bottom-right in @page
    expect(html).not.toContain('@bottom-right { content: "Page " counter(page);');
    // Should have single clean print-page-counter-dock
    expect(html).toContain('print-page-counter-dock');
    expect(html).toContain('<div class="print-page-counter-dock"></div>');
  });

  it('should omit active page number counter when showPageNumbers is false', () => {
    savePrintCustomConfig({ showPageNumbers: false });
    const html = buildPrintHtmlDocument('Test Document', '<p>Test Content</p>', '#ffffff', '#000000');

    expect(html).not.toContain('<div class="print-page-counter-dock"></div>');
  });

  it('should render page number even when both header and footer are turned off', () => {
    savePrintCustomConfig({
      showHeader: false,
      showFooter: false,
      showPageNumbers: true
    });
    const html = buildPrintHtmlDocument('Minimalist Clean Doc', '<p>Content</p>', '#ffffff', '#000000');

    // Header and footer containers should be absent
    expect(html).not.toContain('<div class="print-header">');
    expect(html).not.toContain('<div class="print-footer"');

    // Page number dock should be present
    expect(html).toContain('<div class="print-page-counter-dock"></div>');
  });

  it('should dynamically preserve custom paper background tint and primary ink color in @media print', () => {
    savePrintCustomConfig({
      paperBgColor: '#f4efe6', // Vintage Newsprint
      primaryInkColor: '#1e293b',
      headerAccentColor: '#800000'
    });
    const html = buildPrintHtmlDocument('Vintage Math Exam', '<p>Math Question</p>', '#ffffff', '#000000');

    expect(html).toContain('background: #f4efe6 !important;');
    expect(html).toContain('color: #1e293b !important;');
    expect(html).toContain('color: #800000 !important;');
  });
});
