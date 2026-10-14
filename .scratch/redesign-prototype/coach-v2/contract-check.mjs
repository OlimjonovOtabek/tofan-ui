import assert from 'node:assert/strict';
import {daysFixture,dayRequest,mealDetailsFixture,mealRequest,profileFixture,profileRequest,nutrition,catalogFoods,uuid} from './contract.mjs';

const changedDay=structuredClone(daysFixture[0]);
changedDay.exercises[0].targetReps='8–12';
changedDay.exercises[0].targetWeightKg=null;
const day=dayRequest(changedDay);
assert.deepEqual(Object.keys(day),['dayOfWeek','splitType','title','isRestDay','displayOrder','exercises']);
assert.deepEqual(Object.keys(day.exercises[0]),['exerciseId','targetSets','targetReps','restSeconds','targetWeightKg']);
assert.equal(day.exercises[0].targetReps,'8–12');
assert.equal(day.exercises[0].targetWeightKg,null);
assert.equal('workoutPlanId' in day,false);
assert.equal('nameUz' in day.exercises[0],false);
assert.equal(typeof day.dayOfWeek,'number');

const meal=mealRequest(mealDetailsFixture[uuid(20)]);
assert.deepEqual(Object.keys(meal),['startDate','endDate','isActive','meals']);
assert.deepEqual(Object.keys(meal.meals[0]),['mealType','plannedTime','title','displayOrder','items']);
assert.deepEqual(Object.keys(meal.meals[0].items[0]),['foodId','quantityGrams','estimatedCost']);
assert.equal('dayOfWeek' in meal.meals[0],false);
assert.equal('date' in meal.meals[0],false);
assert.equal('calories' in meal.meals[0].items[0],false);
assert.equal(meal.meals[0].plannedTime,'08:00:00');
assert.equal(meal.meals[0].items[0].estimatedCost,null);

const profile=profileRequest({...profileFixture,displayName:'  Trener Demo  ',bio:'  ',monthlyPrice:'350000'});
assert.deepEqual(Object.keys(profile),['displayName','bio','photoFileId','monthlyPrice']);
assert.equal(profile.displayName,'Trener Demo');
assert.equal(profile.bio,null);
assert.equal(profile.monthlyPrice,350000);
assert.equal('isPublished' in profile,false);

assert.equal(nutrition(catalogFoods[1],200).calories,330);
assert.equal(nutrition(catalogFoods[1],200).proteinGrams,62);
assert.equal(daysFixture.filter(x=>x.workoutPlanId===uuid(10)).length,4);
assert.equal(daysFixture.filter(x=>x.workoutPlanId===uuid(11)).length,2);
const ids=daysFixture.flatMap(x=>x.exercises.map(entry=>entry.id));
assert.equal(new Set(ids).size,ids.length);
for(const plan of Object.values(mealDetailsFixture))for(const current of plan.meals)for(const item of current.items)assert.equal(item.mealPlanMealId,current.id);
console.log('Contract checks passed: workout payload, recurring meal payload, nullable fields, profile ownership, nutrition scaling and fixture relations.');
