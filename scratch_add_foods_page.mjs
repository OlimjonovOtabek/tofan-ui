import fs from 'fs';

function addPage(lang, dict) {
  let file = 'D:/Projects/tofan-ui/src/app/core/i18n/translations/' + lang + '/foods.ts';
  let content = fs.readFileSync(file, 'utf8');
  let obj = JSON.parse(content.replace(/export const foods[A-Za-z]+ = /g, '').replace(/;$/, ''));
  obj.page = dict;
  content = 'export const foods' + lang.charAt(0).toUpperCase() + lang.slice(1) + ' = ' + JSON.stringify(obj, null, 2) + ';';
  fs.writeFileSync(file, content);
}

addPage('uz', {
  title: 'Ovqatlar katalogi',
  totalCount: 'Jami {count} ovqat',
  add: 'Ovqat qo\'shish',
  searchBarcode: 'Shtrix-kod bo\'yicha topish',
  searchBarcodePlaceholder: '4780016470016',
  find: 'Topish',
  barcodeNotFound: '"{barcode}" katalogda yo\'q. Yangi ovqat sifatida qo\'shing.',
  empty: 'Bu shartlarga mos ovqat topilmadi.',
  columns: {
    name: 'Nomi',
    serving: 'Porsiya',
    calories: 'Kaloriya',
    macros: 'O / U / Y',
    source: 'Manba',
    activity: 'Holati'
  },
  actions: {
    edit: 'Tahrirlash',
    delete: 'O\'chirish'
  }
});

addPage('ru', {
  title: 'Каталог еды',
  totalCount: 'Всего {count} продуктов',
  add: 'Добавить еду',
  searchBarcode: 'Поиск по штрих-коду',
  searchBarcodePlaceholder: '4780016470016',
  find: 'Найти',
  barcodeNotFound: '"{barcode}" нет в каталоге. Добавьте как новую еду.',
  empty: 'По этим критериям продуктов не найдено.',
  columns: {
    name: 'Название',
    serving: 'Порция',
    calories: 'Калории',
    macros: 'Б / У / Ж',
    source: 'Источник',
    activity: 'Статус'
  },
  actions: {
    edit: 'Редактировать',
    delete: 'Удалить'
  }
});

addPage('en', {
  title: 'Food Catalog',
  totalCount: 'Total {count} foods',
  add: 'Add Food',
  searchBarcode: 'Search by barcode',
  searchBarcodePlaceholder: '4780016470016',
  find: 'Find',
  barcodeNotFound: '"{barcode}" is not in catalog. Add as new food.',
  empty: 'No food found matching these criteria.',
  columns: {
    name: 'Name',
    serving: 'Serving',
    calories: 'Calories',
    macros: 'P / C / F',
    source: 'Source',
    activity: 'Status'
  },
  actions: {
    edit: 'Edit',
    delete: 'Delete'
  }
});
