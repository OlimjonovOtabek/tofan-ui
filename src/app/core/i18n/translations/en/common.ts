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
  clipboard: {
    copied: '{what} copied.',
    failed: 'Could not copy. {what}: {text}',
  },
};
