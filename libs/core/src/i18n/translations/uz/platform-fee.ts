export const PLATFORM_FEE_UZ = {
  title: 'Platform fee',
  subtitle: "Tofan har bir to'lov narxiga qo'shadigan komissiya, soliq va to'lov provayderi foizi.",
  loading: 'Yuklanmoqda...',
  form: {
    commissionAmount: 'Komissiya summasi',
    commissionHint:
      "Har bir to'lovga qo'shiladigan qat'iy summa. 0 dan kam emas, ko'pi bilan 2 kasr.",
    taxPercent: 'Soliq foizi',
    taxHint: "0 dan 100 gacha, ko'pi bilan 2 kasr (masalan 12).",
    providerFeePercent: "To'lov provayderi foizi",
    providerFeeHint: "0 dan 100 gacha, ko'pi bilan 2 kasr (masalan 2,5).",
    percentSuffix: '%',
    futureOnly:
      "O'zgarish faqat saqlangandan keyin ochilgan to'lovlarga ta'sir qiladi. Avvalgi to'lovlar o'zgarmaydi.",
  },
  errors: {
    commissionAmount: "0 yoki undan katta, ko'pi bilan 2 kasrli son kiriting.",
    percent: "0 dan 100 gacha, ko'pi bilan 2 kasrli son kiriting.",
  },
  confirm: {
    header: "Platform fee ni o'zgartirish",
    message:
      "Platform fee o'zgartirilsinmi? Yangi qiymatlar narxlarga faqat keyingi to'lovlardan boshlab qo'llanadi.",
  },
  toast: {
    saved: 'Platform fee saqlandi.',
  },
};
