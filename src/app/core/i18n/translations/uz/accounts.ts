export const ACCOUNTS_UZ = {
  status: {
    active: 'Faol',
    blocked: 'Bloklangan',
  },
  roles: {
    admin: 'Faqat adminlar',
  },
  list: {
    title: 'Hisoblar',
    total: 'Jami {count} ta hisob',
    empty: 'Bu shartlarga mos hisob topilmadi.',
    emailVerified: 'Email tasdiqlangan',
    columns: {
      userName: 'Username',
      email: 'Email',
      phone: 'Telefon',
      registered: 'Ro‘yxatdan o‘tgan',
      status: 'Holati',
    },
  },
  filters: {
    search: 'Qidirish',
    searchPlaceholder: 'Username, email, ism yoki +998… telefon',
    status: 'Holati',
    role: 'Rol',
    all: 'Hammasi',
    clear: 'Tozalash',
  },
  card: {
    back: 'Hisoblar',
    you: 'Siz',
    id: 'ID',
    userId: 'Foydalanuvchi ID',
    email: 'Email',
    verified: 'Tasdiqlangan',
    unverified: 'Tasdiqlanmagan',
    phone: 'Telefon',
    registered: 'Ro‘yxatdan o‘tgan',
    roles: 'Rollar',
    regularUser: 'Oddiy foydalanuvchi',
    soldierProfile: 'Soldier profili',
    signIns: 'Kirishlar jurnali',
    sendPush: 'Push yuborish',
    block: 'Bloklash',
    unblock: 'Blokdan chiqarish',
    logoutEverywhere: 'Hamma joydan chiqarish',
    cannotBlockSelf: 'O‘z hisobingizni bloklay olmaysiz.',
    tokenLifetime:
      'Foydalanuvchining qo‘lidagi access token muddati tugaguncha API’dan foydalanishi mumkin.',
    loading: 'Yuklanmoqda…',
  },
  confirm: {
    adminWarning: 'Diqqat: bu admin hisobi.',
    blockHeader: 'Hisobni bloklash',
    block:
      '{warning} "{name}" bloklansinmi? Akkaunt o‘chiriladi va hamma sessiyalari yopiladi. {note}',
    unblockHeader: 'Blokdan chiqarish',
    unblock:
      '"{name}" blokdan chiqarilsinmi? Sessiyalar tiklanmaydi — foydalanuvchi qaytadan kiradi.',
    logoutHeader: 'Hamma joydan chiqarish',
    logout: '"{name}" hamma qurilmalardan chiqarilsinmi? Hisob holati o‘zgarmaydi. {note}',
  },
  done: {
    block: 'Hisob bloklandi, sessiyalari yopildi.',
    unblock: 'Hisob blokdan chiqarildi. Foydalanuvchi qaytadan kirishi kerak.',
    logoutEverywhere: 'Foydalanuvchi hamma qurilmalardan chiqarildi.',
  },
};
