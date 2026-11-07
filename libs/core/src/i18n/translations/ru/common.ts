import { Dictionary } from '../../dictionary';

export const COMMON_RU: Dictionary['common'] = {
  toast: {
    success: 'Готово',
    info: 'Информация',
    error: 'Ошибка',
  },
  actions: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    yes: 'Да',
    retry: 'Повторить',
    clear: 'Сбросить',
    edit: 'Изменить',
    view: 'Просмотр',
    copyId: 'Скопировать ID',
    backHome: 'На главную',
  },
  confirm: {
    header: 'Подтвердите действие',
    deleteHeader: 'Подтвердите удаление',
    deleteQuestion: 'Удалить «{subject}»? Это действие нельзя отменить.',
  },
  table: {
    empty: 'Данные не найдены.',
    pageReport: '{first}–{last} из {totalRecords}',
  },
  file: {
    label: 'Файл',
    choose: 'Выбрать файл',
    remove: 'Убрать файл',
    uploaded: 'Файл загружен.',
    upTo: 'до {size}',
  },
  localizedText: {
    label: 'Название',
    hints: {
      en: 'основное',
      uz: 'на узбекском',
      ru: 'на русском',
    },
    required: 'Заполните поле «{label}» ({hint})',
    tooLong: '{label} ({hint}): не больше {max} символов',
  },
  benefits: {
    languages: {
      en: 'Английский',
      ru: 'Русский',
      uz: 'Узбекский',
    },
    row: 'Преимущество {number}',
    count: '{count} / {max}',
    add: 'Добавить преимущество',
    remove: 'Удалить преимущество {number}',
    moveUp: 'Поднять преимущество {number} выше',
    moveDown: 'Опустить преимущество {number} ниже',
    drag: 'Перетащить, чтобы изменить порядок',
    empty: 'Преимуществ нет. Нажмите «Добавить».',
    plainTextWarning:
      'Преимущества хранятся как обычный текст и не обновляются при изменении лимитов. После смены лимита вручную поправьте текст вроде «15 раз в месяц».',
    errors: {
      required: 'Введите текст.',
      tooLong: 'Не больше {max} символов.',
    },
  },
  clipboard: {
    copied: '{what}: скопировано.',
    failed: 'Не удалось скопировать. {what}: {text}',
  },
};
