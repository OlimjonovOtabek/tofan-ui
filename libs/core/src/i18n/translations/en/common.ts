import { Dictionary } from '../../dictionary';

export const COMMON_EN: Dictionary['common'] = {
  toast: {
    success: 'Done',
    info: 'Info',
    error: 'Error',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    yes: 'Yes',
    retry: 'Retry',
    clear: 'Clear',
    edit: 'Edit',
    view: 'View',
    copyId: 'Copy ID',
    backHome: 'Back to home',
  },
  confirm: {
    header: 'Please confirm',
    deleteHeader: 'Confirm deletion',
    deleteQuestion: 'Delete "{subject}"? This cannot be undone.',
  },
  table: {
    empty: 'Nothing found.',
    pageReport: '{first}–{last} of {totalRecords}',
  },
  file: {
    label: 'File',
    choose: 'Choose file',
    remove: 'Remove file',
    uploaded: 'File uploaded.',
    upTo: 'up to {size}',
  },
  localizedText: {
    label: 'Name',
    hints: {
      en: 'main',
      uz: 'Uzbek',
      ru: 'Russian',
    },
    required: '{label} ({hint}) is required',
    tooLong: '{label} ({hint}) must be at most {max} characters',
  },
  benefits: {
    languages: {
      en: 'English',
      ru: 'Russian',
      uz: 'Uzbek',
    },
    row: 'Benefit {number}',
    count: '{count} / {max}',
    add: 'Add benefit',
    remove: 'Remove benefit {number}',
    moveUp: 'Move benefit {number} up',
    moveDown: 'Move benefit {number} down',
    drag: 'Drag to reorder',
    empty: 'No benefits yet. Press Add.',
    plainTextWarning:
      'Benefits are plain text and do not follow limit changes. After changing a limit, update texts such as "15 per month" by hand.',
    errors: {
      required: 'Enter the text.',
      tooLong: 'At most {max} characters.',
    },
  },
  clipboard: {
    copied: '{what} copied.',
    failed: 'Could not copy. {what}: {text}',
  },
};
