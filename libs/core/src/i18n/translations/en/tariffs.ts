import { Dictionary } from '../../dictionary';

export const TARIFFS_EN: Dictionary['tariffs'] = {
  page: {
    title: 'Tofan tariffs',
    subtitle: 'Price, limits and benefits of the Free, Standard and VIP tariffs',
    empty: 'No tariffs found.',
    loading: 'Loading tariffs...',
  },
  type: {
    free: 'Free',
    standard: 'Standard',
    vip: 'VIP',
  },
  mealType: {
    breakfast: 'Breakfast',
    secondBreakfast: 'Second breakfast',
    lunch: 'Lunch',
    snack: 'Snack',
    dinner: 'Dinner',
    preWorkout: 'Pre-workout',
    postWorkout: 'Post-workout',
  },
  card: {
    monthlyPrice: 'Monthly price',
    totalPrice: 'Total price a Soldier pays',
    price: '{amount} UZS',
    limits: 'Limits',
    benefits: 'Benefits',
    noBenefits: 'No benefits yet.',
    editBenefits: 'Benefits',
  },
  benefits: {
    dialogHeader: '{tariff} tariff benefits',
  },
  limits: {
    foodScan: {
      label: 'Food scan',
      unlimited: 'Unlimited',
      closed: 'Scan closed',
      some: '{count} per month',
    },
    workoutVideo: {
      label: 'Workout videos',
      unlimited: 'All open',
      some: '{count} videos open',
    },
    mealTypes: {
      label: 'Meal types',
      all: 'All meals open',
      some: 'Only the chosen ones are open',
    },
    workoutChange: {
      label: 'Workout program change',
      never: 'Never changes',
      every: 'Every {count} months',
    },
    dietChange: {
      label: 'Diet program change',
      never: 'Never changes',
      every: 'Every {count} days',
    },
    aiChat: {
      label: 'AI trainer chat',
      included: 'Included',
      excluded: 'Not included',
    },
  },
  form: {
    header: 'Edit tariff: {name}',
    monthlyPrice: 'Monthly price',
    priceSuffix: ' UZS',
    freeHint: 'Free is always free',
    totalPriceHint: 'The backend works out the total price after saving, it cannot be edited.',
    foodScan: {
      label: 'Food scan limit',
      unlimited: 'Unlimited',
      value: 'Scans per month',
      hint: 'A value of 0 closes scanning.',
    },
    workoutVideo: {
      label: 'Workout video limit',
      unlimited: 'All open',
      value: 'Number of open videos',
    },
    mealTypes: {
      label: 'Meal types',
      all: 'All meals open',
      placeholder: 'Choose meal types',
    },
    workoutChange: {
      label: 'Workout program change',
      never: 'Never changes',
      value: 'Once in how many months',
      suffix: ' mo',
    },
    dietChange: {
      label: 'Diet program change',
      never: 'Never changes',
      value: 'Once in how many days',
      suffix: ' d',
    },
    aiChat: {
      label: 'AI trainer chat',
      enabled: 'Included in the tariff',
    },
    errors: {
      price: 'The price must be above 0.',
      scanLimit: 'Enter a whole number from 0.',
      videoLimit: 'Enter a whole number from 0.',
      changeMonths: 'Enter a whole number from 1.',
      changeDays: 'Enter a whole number from 1.',
      mealTypes: 'Choose at least one meal type.',
    },
  },
  toast: {
    saved: 'Tariff saved',
    benefitsSaved: 'Benefits saved',
  },
};
