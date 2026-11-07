export const TARIFFS_UZ = {
  page: {
    title: 'Tofan tariflari',
    subtitle: 'Free, Standard va VIP tariflarining narxi, limitlari va imtiyozlari',
    empty: 'Tariflar topilmadi.',
    loading: 'Tariflar yuklanmoqda...',
  },
  type: {
    free: 'Free',
    standard: 'Standard',
    vip: 'VIP',
  },
  card: {
    monthlyPrice: 'Oylik narx',
    totalPrice: "O'quvchi to'laydigan jami narx",
    price: "{amount} so'm",
    limits: 'Limitlar',
    benefits: 'Imtiyozlar',
    noBenefits: 'Imtiyozlar hali kiritilmagan.',
    editBenefits: 'Imtiyozlar',
  },
  benefits: {
    dialogHeader: '{tariff} tarifi imtiyozlari',
  },
  limits: {
    foodScan: {
      label: 'Ovqat scan',
      unlimited: 'Cheksiz',
      closed: 'Scan yopiq',
      some: 'Oyiga {count} ta',
    },
    workoutVideo: {
      label: 'Mashq videolari',
      unlimited: 'Hammasi ochiq',
      some: '{count} ta video ochiq',
    },
    mealTypes: {
      label: 'Ovqat turlari',
      all: 'Hamma ovqat ochiq',
      some: 'Faqat tanlanganlar ochiq',
    },
    workoutChange: {
      label: 'Mashq dasturini almashtirish',
      never: 'Almashmaydi',
      every: 'Har {count} oyda',
    },
    dietChange: {
      label: 'Ovqat dasturini almashtirish',
      never: 'Almashmaydi',
      every: 'Har {count} kunda',
    },
    aiChat: {
      label: 'AI trener chati',
      included: 'Bor',
      excluded: "Yo'q",
    },
  },
  form: {
    header: 'Tarifni tahrirlash: {name}',
    monthlyPrice: 'Oylik narx',
    priceSuffix: " so'm",
    freeHint: 'Free doim bepul',
    totalPriceHint:
      "Jami narxni saqlagandan keyin backend qayta hisoblaydi, uni o'zgartirib bo'lmaydi.",
    foodScan: {
      label: 'Ovqat scan limiti',
      unlimited: 'Cheksiz',
      value: 'Oyiga nechta scan',
      hint: "0 kiritilsa scan yopiq bo'ladi.",
    },
    workoutVideo: {
      label: 'Mashq videolari limiti',
      unlimited: 'Hammasi ochiq',
      value: 'Ochiq videolar soni',
    },
    mealTypes: {
      label: 'Ovqat turlari',
      all: 'Hamma ovqat ochiq',
      placeholder: 'Ovqat turlarini tanlang',
    },
    workoutChange: {
      label: 'Mashq dasturini almashtirish',
      never: 'Almashmaydi',
      value: 'Necha oyda bir marta',
      suffix: ' oy',
    },
    dietChange: {
      label: 'Ovqat dasturini almashtirish',
      never: 'Almashmaydi',
      value: 'Necha kunda bir marta',
      suffix: ' kun',
    },
    aiChat: {
      label: 'AI trener chati',
      enabled: 'Tarifga kiritilgan',
    },
    errors: {
      price: "Narx 0 dan katta bo'lishi kerak.",
      scanLimit: '0 yoki undan katta butun son kiriting.',
      videoLimit: '0 yoki undan katta butun son kiriting.',
      changeMonths: '1 yoki undan katta butun son kiriting.',
      changeDays: '1 yoki undan katta butun son kiriting.',
      mealTypes: 'Kamida bitta ovqat turini tanlang.',
    },
  },
  toast: {
    saved: 'Tarif saqlandi',
    benefitsSaved: 'Imtiyozlar saqlandi',
  },
};
