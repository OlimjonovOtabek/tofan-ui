export const goals = ['','Vazn kamaytirish','Mushak oshirish','Vaznni saqlash','Tana tarkibini yaxshilash'];
export const levels = ['','Boshlang‘ich','O‘rta','Yuqori'];
export const weekdays = ['','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'];
export const splits = ['','To‘liq tana','Yuqori / quyi tana','Push / Pull / Legs','Bro split','Kardio','Harakatchanlik','Shaxsiy','Dam olish'];
export const mealTypes = ['','Nonushta','Tushlik','Kechki ovqat','Tamaddi','Mashg‘ulotdan oldin','Mashg‘ulotdan keyin'];
export const muscles = ['Noma’lum','Ko‘krak','Orqa','Yelka','Bitseps','Tritseps','Bilak','Qorin','Yon qorin','Dumba','Son (old)','Son (orqa)','Boldir','To‘liq tana','Kardio'];
export const equipment = ['Jihoz yo‘q','O‘z vazni','Shtanga','Gantel','Girya','Trenajyor','Blok (tros)','Rezina lenta','Skameyka','Turnik','Smit mashinasi'];
export const exerciseTypes = ['','Kuch','Kardio','Harakatchanlik','Egiluvchanlik','Isinish','Sovish'];
export const genders = ['Barchasi','Erkak','Ayol'];

export function uuid(number) {
  return `00000000-0000-4000-8000-${String(number).padStart(12,'0')}`;
}

const exerciseSeed = [
  ['Shtanga bilan o‘tirib turish','Barbell squat','Приседания со штангой',10,2,2],
  ['Gantel bilan ko‘krak pressi','Dumbbell bench press','Жим гантелей лёжа',1,3,2],
  ['Turnikda tortilish','Pull-up','Подтягивания',2,9,3],
  ['Planka','Plank','Планка',7,1,1],
  ['Yelka pressi','Shoulder press','Жим на плечи',3,3,2],
  ['Ruminiya tortishi','Romanian deadlift','Румынская тяга',11,2,2],
  ['Oldinga qadam tashlash','Lunge','Выпады',10,3,1],
  ['Gantelni tortish','Dumbbell row','Тяга гантели',2,3,2],
];

export const catalogExercises = exerciseSeed.map(([nameUz,name,nameRu,muscleGroup,equipmentType,difficulty],index)=>({
  id:uuid(100+index),name,nameUz,nameRu,muscleGroup,equipmentType,difficulty,type:1,gender:0,
  isCompound:index!==3,isHomeExercise:equipmentType===1,isActive:true,
  instructions:'Harakatni nazorat bilan bajaring. Belni tekis tuting.',videoFileId:index<3?uuid(800+index):null,
}));
export const ownedExercises = [
  {...catalogExercises[4],id:uuid(200),nameUz:'O‘tirib yelka pressi',name:'Seated shoulder press',nameRu:'Жим гантелей сидя',videoFileId:null},
  {...catalogExercises[7],id:uuid(201),nameUz:'Bir qo‘lda gantel tortish',name:'Single arm row',nameRu:'Тяга гантели одной рукой'},
];

const foodSeed = [['Suli yormasi',100,389,16.9,66.3,6.9],['Tovuq ko‘kragi',100,165,31,0,3.6],['Guruch',100,130,2.7,28,0.3],['Yunon yogurti',100,59,10,3.6,0.4],['Banan',100,89,1.1,22.8,0.3],['Avokado',100,160,2,8.5,14.7]];
export const catalogFoods=foodSeed.map(([name,servingSizeGrams,caloriesPerServing,proteinGrams,carbsGrams,fatGrams],index)=>({
  id:uuid(300+index),name,nameUz:name,nameRu:name,servingSizeGrams,caloriesPerServing,proteinGrams,carbsGrams,fatGrams,
  fiberGrams:null,source:1,servingUnit:1,isVerified:true,isActive:true,isFavorite:false,isMine:false,
}));
export const ownedFoods=[{id:uuid(400),userId:uuid(1),name:'Trenerning suli aralashmasi',servingSizeGrams:100,caloriesPerServing:340,proteinGrams:18,carbsGrams:46,fatGrams:9,fiberGrams:6,createdOnUtc:'2026-10-01T09:00:00Z'}];

export const profileFixture={id:uuid(1),userId:uuid(2),displayName:'Trener Demo',bio:'Kuch mashqlari va muvozanatli ovqatlanish. Har bir reja aniq maqsadga yo‘naltirilgan.',photoFileId:null,monthlyPrice:350000,isPublished:true,createdOnUtc:'2026-09-01T08:00:00Z'};
export const workoutsFixture=[
  {id:uuid(10),name:'Kuch va muvozanat',goal:2,experienceLevel:2,isHomeWorkout:false,isPublished:true,dayCount:4,createdOnUtc:'2026-10-01T09:00:00Z'},
  {id:uuid(11),name:'Uyda faol harakat',goal:1,experienceLevel:1,isHomeWorkout:true,isPublished:false,dayCount:2,createdOnUtc:'2026-10-06T10:30:00Z'},
  {id:uuid(12),name:'Boshlang‘ich kuch',goal:3,experienceLevel:1,isHomeWorkout:false,isPublished:false,dayCount:0,createdOnUtc:'2026-10-09T08:00:00Z'},
];
export const mealsFixture=[
  {id:uuid(20),startDate:'2026-10-09',endDate:'2026-10-15',isPublished:true,mealCount:3,createdOnUtc:'2026-10-01T09:00:00Z'},
  {id:uuid(21),startDate:'2026-10-16',endDate:'2026-10-22',isPublished:false,mealCount:2,createdOnUtc:'2026-10-07T09:00:00Z'},
];

function exerciseEntry(index,order) {
  const source=catalogExercises[index];
  return {id:uuid(500+index+order),exercise:{id:source.id,name:source.name,nameRu:source.nameRu,nameUz:source.nameUz},targetSets:3,targetReps:index===3?'30–45 s':'8–12',restSeconds:60,targetWeightKg:index===3?null:20,displayOrder:order};
}

export const daysFixture=[
  {id:uuid(50),workoutPlanId:uuid(10),dayOfWeek:1,splitType:2,title:'Yuqori tana',isRestDay:false,displayOrder:0,exercises:[exerciseEntry(1,0),exerciseEntry(2,1),exerciseEntry(4,2)]},
  {id:uuid(51),workoutPlanId:uuid(10),dayOfWeek:3,splitType:2,title:'Oyoqlar va qorin',isRestDay:false,displayOrder:1,exercises:[exerciseEntry(0,0),exerciseEntry(5,1),exerciseEntry(3,2)]},
  {id:uuid(52),workoutPlanId:uuid(10),dayOfWeek:5,splitType:1,title:'To‘liq tana',isRestDay:false,displayOrder:2,exercises:[exerciseEntry(6,0),exerciseEntry(7,1),exerciseEntry(3,2)]},
  {id:uuid(53),workoutPlanId:uuid(10),dayOfWeek:7,splitType:8,title:'Tiklanish',isRestDay:true,displayOrder:3,exercises:[]},
  {id:uuid(54),workoutPlanId:uuid(11),dayOfWeek:2,splitType:1,title:'Uy mashg‘uloti',isRestDay:false,displayOrder:0,exercises:[exerciseEntry(3,0)]},
  {id:uuid(55),workoutPlanId:uuid(11),dayOfWeek:4,splitType:1,title:'Faol harakat',isRestDay:false,displayOrder:1,exercises:[]},
];

export function nutrition(food,quantityGrams) {
  const factor=quantityGrams/food.servingSizeGrams;
  return {calories:food.caloriesPerServing*factor,proteinGrams:food.proteinGrams*factor,carbsGrams:food.carbsGrams*factor,fatGrams:food.fatGrams*factor};
}

function mealItem(index,quantityGrams) {
  const food=catalogFoods[index];
  return {id:uuid(600+index),mealPlanMealId:uuid(70),foodId:food.id,foodName:food.name,foodNameRu:food.nameRu,foodNameUz:food.nameUz,quantityGrams,...nutrition(food,quantityGrams),estimatedCost:null};
}

export const mealDetailsFixture={
  [uuid(20)]:{id:uuid(20),userId:uuid(2),startDate:'2026-10-09',endDate:'2026-10-15',source:5,isActive:true,createdOnUtc:'2026-10-01T09:00:00Z',meals:[
    {id:uuid(70),mealPlanId:uuid(20),mealType:1,plannedTime:'08:00:00',title:'Quvvatli nonushta',displayOrder:0,items:[mealItem(0,60),mealItem(4,120)]},
    {id:uuid(71),mealPlanId:uuid(20),mealType:2,plannedTime:'13:00:00',title:'Muvozanatli tushlik',displayOrder:1,items:[mealItem(1,180),mealItem(2,200)]},
    {id:uuid(72),mealPlanId:uuid(20),mealType:3,plannedTime:'19:00:00',title:'Yengil kechki ovqat',displayOrder:2,items:[mealItem(3,200),mealItem(5,80)]},
  ]},
  [uuid(21)]:{id:uuid(21),userId:uuid(2),startDate:'2026-10-16',endDate:'2026-10-22',source:5,isActive:true,createdOnUtc:'2026-10-07T09:00:00Z',meals:[
    {id:uuid(73),mealPlanId:uuid(21),mealType:1,plannedTime:'08:00:00',title:'Nonushta',displayOrder:0,items:[mealItem(0,70)]},
    {id:uuid(74),mealPlanId:uuid(21),mealType:2,plannedTime:null,title:'Tushlik',displayOrder:1,items:[]},
  ]},
};

export const clientsFixture=[
  {userId:uuid(900),firstName:'Aziz',lastName:'Demo',gender:1,goal:1,currentWeightKg:82.4,targetWeightKg:76,subscribedOnUtc:'2026-10-01T08:00:00Z',subscriptionEndsOnUtc:'2026-11-01T08:00:00Z'},
  {userId:uuid(901),firstName:'Madina',lastName:'Demo',gender:2,goal:3,currentWeightKg:58.6,targetWeightKg:58,subscribedOnUtc:'2026-09-28T08:00:00Z',subscriptionEndsOnUtc:'2026-10-28T08:00:00Z'},
  {userId:uuid(902),firstName:'Jasur',lastName:'Demo',gender:1,goal:2,currentWeightKg:74.2,targetWeightKg:80,subscribedOnUtc:'2026-10-04T08:00:00Z',subscriptionEndsOnUtc:'2026-11-04T08:00:00Z'},
  {userId:uuid(903),firstName:'Nodira',lastName:'Demo',gender:2,goal:1,currentWeightKg:null,targetWeightKg:62,subscribedOnUtc:'2026-09-25T08:00:00Z',subscriptionEndsOnUtc:'2026-10-25T08:00:00Z'},
];
export const weightsFixture=[84.2,84,83.7,83.9,83.5,83.2,82.8,82.6,82.4].map((weightKg,index)=>({id:uuid(950+index),weightKg,loggedDate:`2026-10-${String(index+1).padStart(2,'0')}`,loggedOnUtc:`2026-10-${String(index+1).padStart(2,'0')}T07:00:00Z`,note:null}));
export const adherenceFixture={fromDate:'2026-10-01',toDate:'2026-10-09',scheduledDays:4,completedDays:3,missedDays:1,restDays:2,adherencePercent:75,days:[
  {date:'2026-10-01',dayOfWeek:4,isRestDay:false,isMissed:false,sessionStatus:2},
  {date:'2026-10-03',dayOfWeek:6,isRestDay:false,isMissed:true,sessionStatus:null},
  {date:'2026-10-05',dayOfWeek:1,isRestDay:false,isMissed:false,sessionStatus:2},
  {date:'2026-10-07',dayOfWeek:3,isRestDay:false,isMissed:false,sessionStatus:2},
  {date:'2026-10-04',dayOfWeek:7,isRestDay:true,isMissed:false,sessionStatus:null},
  {date:'2026-10-08',dayOfWeek:4,isRestDay:true,isMissed:false,sessionStatus:null},
]};
export const dailyNutritionFixture={date:'2026-10-09',consumedCalories:1840,targetCalories:2100,proteinGrams:124,carbsGrams:218,fatGrams:58,targetProteinGrams:140,targetCarbsGrams:250,targetFatGrams:65,mealsLogged:3};

let fixtureEntry=5000;
for(const day of daysFixture)day.exercises.forEach(entry=>{entry.id=uuid(fixtureEntry++);});
for(const plan of Object.values(mealDetailsFixture))for(const meal of plan.meals)meal.items.forEach(item=>{item.id=uuid(fixtureEntry++);item.mealPlanMealId=meal.id;});

export function dayRequest(day) {
  return {dayOfWeek:day.dayOfWeek,splitType:day.splitType,title:day.title,isRestDay:day.isRestDay,displayOrder:day.displayOrder,exercises:day.exercises.map(entry=>({exerciseId:entry.exercise.id,targetSets:Number(entry.targetSets),targetReps:String(entry.targetReps),restSeconds:Number(entry.restSeconds),targetWeightKg:entry.targetWeightKg===null||entry.targetWeightKg===''?null:Number(entry.targetWeightKg)}))};
}

export function mealRequest(plan) {
  return {startDate:plan.startDate,endDate:plan.endDate,isActive:plan.isActive,meals:plan.meals.map(meal=>({mealType:meal.mealType,plannedTime:meal.plannedTime,title:meal.title,displayOrder:meal.displayOrder,items:meal.items.map(item=>({foodId:item.foodId,quantityGrams:Number(item.quantityGrams),estimatedCost:item.estimatedCost}))}))};
}

export function profileRequest(profile) {
  return {displayName:profile.displayName.trim(),bio:profile.bio?.trim()||null,photoFileId:profile.photoFileId,monthlyPrice:Number(profile.monthlyPrice)};
}

export function sumNutrition(items) {
  return items.reduce((total,item)=>({calories:total.calories+item.calories,proteinGrams:total.proteinGrams+item.proteinGrams,carbsGrams:total.carbsGrams+item.carbsGrams,fatGrams:total.fatGrams+item.fatGrams}),{calories:0,proteinGrams:0,carbsGrams:0,fatGrams:0});
}
