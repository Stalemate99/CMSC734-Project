// Creating basic designs
function convertStringToBoolean(val) {
  if (val === "0") return false;

  return true;
}

const convertHeaderToKey = {
  "I am currently employed at least part-time": "employment_status",
  "I identify as having a mental illness": "mental_illness_status",
  "Education": "education",
  "I have my own computer separate from a smart phone": "pc_status",
  "I have been hospitalized before for my mental illness": "hospitalized_for_mental_illness",
  "How many days were you hospitalized for your mental illness": "hospitalized_for_mental_illness_days",
  "I am legally disabled": "legally_disabled",
  "I have my regular access to the internet": "internet_status",
  "I live with my parents": "live_with_parents",
  "I have a gap in my resume": "gap_in_resume",
  "Total length of any gaps in my resume in months.": "gap_in_resume_length",
  "Annual income (including any social welfare programs) in USD": "total_annual_income",
  "I am unemployed": "unemployment_status",
  "I read outside of work and school": "learning_status",
  "Annual income from social welfare programs": "annual_income_social_welfare",
  "I receive food stamps": "food_stamps",
  "I am on section 8 housing": "section_8_housing",
  "How many times were you hospitalized for your mental illness": "hospitalized_for_mental_illness_count",
  "Lack of concentration": "lack_of_concentration",
  "Anxiety": "anxiety",
  "Depression": "depression",
  "Obsessive thinking": "obsessive_thinking",
  "Mood swings": "mood_swings",
  "Panic attacks": "panic_attacks",
  "Compulsive behavior": "compulsive_behavior",
  "Tiredness": "tiredness",
  "Age": "age",
  "Gender": "gender",
  "Household Income": "household_income",
  "Region": "region",
  "Device Type": "device_type"
};

const numericalKeys = [
  "total_annual_income",
  "annual_income_social_welfare",
  "gap_in_resume_length",
  "hospitalized_for_mental_illness_count",
  "hospitalized_for_mental_illness_days"
];

const booleanKeys = [
  "mental_illness_status",
  "anxiety",
  "depression",
  "obsessive_thinking",
  "mood_swings",
  "panic_attacks",
  "compulsive_behavior",
  "tiredness",
  "hospitalized_for_mental_illness",
  "legally_disabled",
  "gap_in_resume",
  "employment_status",
  "unemployment_status",
  "learning_status",
  "food_stamps",
  "section_8_housing",
  "internet_status",
  "live_with_parents",
  "pc_status"
];

function dataProcessor(data) {
  const cleanedData = {};
  Object.keys(data).forEach(key => {
    const transformedKey = convertHeaderToKey[key];

    if (numericalKeys.includes(transformedKey)) {
      cleanedData[transformedKey] = +data[key];
    } else if (booleanKeys.includes(transformedKey)) {
      cleanedData[transformedKey] = convertStringToBoolean(data[key]);
    } else {
      cleanedData[transformedKey] = data[key];
    }
  });

  return cleanedData;
}

d3.csv('data.csv', dataProcessor).then((data) => {
  console.log("Data Loaded", data);
});