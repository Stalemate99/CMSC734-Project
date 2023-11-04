// Creating basic designs

// Utility functions
function convertStringToBoolean(val) {
  if (val === "0") return false;

  return true;
}

const HEADER_TO_KEY_HASH = {
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

const NUMERICAL_KEYS = [
  "total_annual_income",
  "annual_income_social_welfare",
  "gap_in_resume_length",
  "hospitalized_for_mental_illness_count",
  "hospitalized_for_mental_illness_days"
];

const BOOLEAN_KEYS = [
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
    const TRANSFORMED_KEY = HEADER_TO_KEY_HASH[key];

    if (NUMERICAL_KEYS.includes(TRANSFORMED_KEY)) {
      cleanedData[TRANSFORMED_KEY] = +data[key];
    } else if (BOOLEAN_KEYS.includes(TRANSFORMED_KEY)) {
      cleanedData[TRANSFORMED_KEY] = convertStringToBoolean(data[key]);
    } else {
      cleanedData[TRANSFORMED_KEY] = data[key];
    }
  });

  return cleanedData;
}

d3.csv('data.csv', dataProcessor).then((data) => {
  // Globally Initializing Dataset
  mentalHealthData = data;
  
  generateTask2_5();
  generateTask4_8();
  generateTask5_4();
});

function generateTask2_5() {

  // Processing Data
  const MENTAL_ILLNESS = [
    "anxiety",
    "compulsive_behavior",
    "depression",
    "lack_of_concentration",
    "legally_disabled",
    "mood_swings",
    "obsessive_thinking",
    "panic_attacks",
    "tiredness"
  ];

  const HOUSEHOLD_INCOME_CATEGORIES = [
    "$0-$9,999",
    "$10,000-$24,999",
    "$25,000-$49,999",
    "$50,000-$74,999",
    "$75,000-$99,999",
    "$100,000-$124,999",
    "$125,000-$149,999",
    "$150,000-$174,999",
    "$175,000-$199,999",
    "$200,000+"
  ];

  const graphData = d3.nest()
    .key((data) => data.household_income)
    .key(data => data.employment_status)
    .rollup((values) => {
      if (values.employment_status) return;
      const illnessValues = [];

      MENTAL_ILLNESS.forEach(illness => {
        illnessValues.push(d3.sum(values, data => data[illness]));
      });

      return illnessValues;
    })
    .entries(mentalHealthData);

  console.log(graphData)

  // Drawing Graph 1
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 700;
  const initialPaddingVertical = 40;
  const initialPaddingHorizontal = 100;
  const categoryWidth = 60;
  const padding = 3;

  // Scales
  const rangeGenerator = HOUSEHOLD_INCOME_CATEGORIES.map((item, idx) => {
    return initialPaddingHorizontal + (categoryWidth / 2) + (idx * categoryWidth);
  });
  rangeGenerator.unshift(initialPaddingHorizontal);
  rangeGenerator.push(SVG_WIDTH - MARGIN.r);
  HOUSEHOLD_INCOME_CATEGORIES.unshift('');
  HOUSEHOLD_INCOME_CATEGORIES.push('');
  const xScaleExtent = d3.extent(graphData, (data) => {
    if (data.values[0].key === 'false') return d3.extent(data.values[0].value);
    else return d3.extent(data.values[1].value);
  });
  const xScale = d3.scaleLinear()
    .domain([0, 30])
    .range([initialPaddingHorizontal, SVG_WIDTH]);
  const yScale = d3.scaleOrdinal()
    .domain(HOUSEHOLD_INCOME_CATEGORIES)
    .range(rangeGenerator);
  const radiusScale = (data) => d3.scaleLinear()
    .domain(data)
    .range([padding, (categoryWidth / 2) - padding]);
  const colorScale = d3.scaleOrdinal()
    .domain(MENTAL_ILLNESS)
    .range(d3.schemeTableau10);

  // Graph Components
  const container = d3.select("#main")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  const graph = container.selectAll(".graph_1")
    .data(graphData)
    .enter()
    .append("g")
    .attr("class", "graph_1");

  const lines = graph.selectAll(".line")
    .data(data => data.key)
    .enter()
    .append('path')
    .attr("class", ".line")
    .attr("d", (data, idx) => {
      return `M${initialPaddingHorizontal},${initialPaddingVertical + categoryWidth + (idx * categoryWidth)} L${SVG_WIDTH},${categoryWidth + initialPaddingVertical + (idx * categoryWidth)}`
    })
    .attr("fill", "none")
    .attr("stroke", "cadetblue")
    .attr("stroke-width", "2")
    .attr("stroke-dasharray", "5,5");

  const illnessPlots = graph.selectAll(".plots")
    .data(data => {
      if (data.values[0].key === 'false') return data.values[0].value;
      else return data.values[1].value;
    })
    .enter()
    .append("circle")
    .attr("class", "plots")
    .attr("r", 5)
    .attr("cx", (data, idx) => {
      return xScale(data);
    })
    .attr("cy", (data, idx) => initialPaddingVertical + (idx * categoryWidth) + yScale(data))
    .attr("fill", data => colorScale(data));

  // Axes
  const xAxis = d3.axisTop(xScale);
  const yAxis = d3.axisLeft(yScale);

  graph.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(-5,${initialPaddingVertical})`)
    .call(xAxis);
  graph.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${initialPaddingHorizontal},0)`)
    .call(yAxis);

  // Labels
  graph.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(0,${SVG_HEIGHT / 2}) rotate(270)`)
    .text("Household Income Categories");
  graph.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${SVG_WIDTH / 2},${initialPaddingVertical / 2})`)
    .text("Mental Illnesses");
}

function generateTask4_8() {
  // Task 4-8 Star chart depicting various socioeconomic factors and
  // MH contributions

  // Data Processing
  const SOCIOECONOMIC_FACTORS = [
    "education_status",
    "unemployed_status",
    "food_stamps",
    "internet_status",
    "live_with_parents",
    "section_8_housing"
  ];
  const COMPLETED_EDUCATION = [
    "Completed Masters",
    "Completed Phd",
    "Completed Undergraduate",
    "Some Phd",
    "Some Masters",
  ];

  const graphInitialObject = SOCIOECONOMIC_FACTORS.reduce((obj, key) => {
    obj[key] = 0;
    return obj;
  }, {});

  const filteredData = [];
  mentalHealthData.forEach(item => {
    if (item.mental_illness_status) filteredData.push({
      education_status: COMPLETED_EDUCATION.includes(item.education) ? true : false,
      unemployed_status: item.employment_status ? false : true,
      food_stamps: item.food_stamps,
      internet_status: item.internet_status,
      live_with_parents: item.live_with_parents,
      section_8_housing: item.section_8_housing,
    });
  });

  const graphData = filteredData.reduce((result, entry) => {
    Object.keys(entry).forEach(key => {
      if (entry[key]) result[key] += 1;
    });

    return result;
  }, graphInitialObject);

  // Draw graph
  let SVG_WIDTH = 500;
  let SVG_HEIGHT = 500;
  const radius = SVG_WIDTH / 2;
  const angle = 360 / Object.keys(graphData).length;
  const line = d3.lineRadial()
    .angle((d, i) => i * angle)
    .radius(d => ((d / 2) * (radius / 100)));

  // Scales
  const radiusScale = d3.scaleLinear()
    .domain(d3.extent(Object.values(graphData)))
    .range([(radius - MARGIN.t) / 2, radius - MARGIN.t])
  // .nice();

  const container = d3.select("#main")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  const graph = container.append("g")
    .attr("class", "graph_2")
    .attr("transform", `translate(${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`);

  const starGraphBg = graph.selectAll(".graph_2 .line_bg")
    .data(Object.values(graphData))
    .enter()
    .append("path")
    .attr("class", "line_bg")
    .attr("d", (data) => {
      return `M0,0 L0,${radius - MARGIN.t}`
    })
    .attr("transform", (data, idx) => {
      return `rotate(${(idx * angle)})`;
    })
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "none");

  const starGraphBgConnector = graph.append("path")
    .attr("d", () => {
      const r = radius - MARGIN.t;
      let point1 = [0, r];
      let point2 = [(r / 2) * Math.sqrt(3), r / 2];
      let point4 = [0, -r];
      let point5 = [-point2[0], -point2[1]];

      return `M0,${r} L${point2[0]},${point2[1]} v${-r} L${point4[0]},${point4[1]} L${point5[0]},${point5[1]} v${r} L${point1[0]},${point1[1]}`;
    })
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .style("fill", "none");

  const starGraph = graph.selectAll(".graph_2 .line")
    .data(Object.values(graphData))
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (data) => {
      return `M0,0 L0,${radiusScale(data)}`
    })
    .attr("transform", (data, idx) => {
      return `rotate(${(idx * angle)})`;
    })
    .style("stroke", "black")
    .style("stroke-width", 3)
    .style("fill", "none");

  const starGraphConnector = graph.append("path")
    .attr("d", () => {
      const r = radiusScale(radius - MARGIN.t);
      const points = Object.values(graphData).map(item => radiusScale(item));
      const m = Math.sqrt(3) / 2;

      let pointString = `M0,${points[0]} L${points[1] * m - MARGIN.t - MARGIN.t - MARGIN.t - MARGIN.t},${points[1] / 2 - MARGIN.t - MARGIN.t - 5} L${points[2] * m + MARGIN.t},${-points[2] / 2 - 5} L0,${-points[3]} L${-points[4] * m + MARGIN.t},${-points[4] / 2 + 5} L${-points[5] * m - MARGIN.t - MARGIN.t - MARGIN.t - MARGIN.t},${points[5] / 2 + MARGIN.t + MARGIN.t + 5} Z`;

      return pointString;
    })
    .style("stroke", "blue")
    .style("stroke-width", 3)
    .style("fill", "none");

  graph.selectAll(".graph_2 .label")
    .data(Object.entries(graphData))
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("x", (data, idx) => {
      const r = radiusScale(data[1]);
      const m = Math.sqrt(3) / 2;

      switch (idx) {
        case 1:
          return m * r - 10;
        case 2:
          return m * r + 10;
        case 4:
          return -m * r - 5;
        case 5:
          return -m * r - 40;
        default:
          return 0;
      };
    })
    .attr("y", (data, idx) => {
      const r = radiusScale(data[1]);

      switch (idx) {
        case 1:
          return r / 2 - 10;
        case 2:
          return -r / 2 - 10;
        case 3:
          return -r
        case 4:
          return -r / 2 - 5;
        case 5:
          return r / 2 + 40;
        default:
          return r + 10;
      };
    })
    .text((data, idx) => SOCIOECONOMIC_FACTORS[idx]);

}

function generateTask5_4() {
  // Task 5-4 - Bar Chart for Various Mental Illness vs Age groups

  // Data Pracessing
  const filteredData = mentalHealthData.map(item => {
    return [item.age, item.mental_illness_status, item.anxiety, item.compulsive_behavior, item.depression, item.lack_of_concentration, item.legally_disabled, item.mood_swings, item.obsessive_thinking, item.panic_attacks, item.tiredness];
  });

  const nestedData = d3.nest()
    .key(data => data[0])
    .rollup(values => {
      const result = [];

      for (let i = 2; i < 11; i++) {
        const total = d3.sum(values, data => {
          if (data[i]) return data[i];
        });

        result.push(total);
      }

      return result
    })
    .entries(filteredData);

  // console.log(nestedData)

  // Draw graph
  const rectWidth = 20;
  const categoryWidth = 200;
  const padding = 2;
  const initial_padding_h = 30;
  const initial_padding_w = 50;
  const ageGroups = ['18-29', '30-44', '45-59', '>60'];

  // Scales
  const rangeGenerator = ageGroups.map((item, idx) => {
    return initial_padding_w + (categoryWidth / 2) + (idx * categoryWidth);
  });
  rangeGenerator.unshift(initial_padding_w);
  rangeGenerator.push(SVG_WIDTH - MARGIN.r);
  ageGroups.unshift('');
  ageGroups.push('');

  const xScale = d3.scaleOrdinal()
    .domain(ageGroups)
    .range(rangeGenerator);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(nestedData, data => d3.max(data.value))])
    .range([2, SVG_HEIGHT - MARGIN.t - initial_padding_h])
    .nice();
  const colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    .range(d3.schemeTableau10);

  const container = d3.select("#main")
    .append("svg")
    .attr("class", "graph_3_container")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  const graph = container.selectAll(".graph_3")
    .data(nestedData)
    .enter()
    .append("g")
    .attr("class", "graph_3");

  let sectionCount = 0;

  const bars = graph.selectAll(".bar")
    .data(d => [...d.value])
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", rectWidth)
    .attr("height", data => yScale(data))
    .attr("x", (data, idx) => {
      let position = initial_padding_w + padding + (idx * rectWidth) + (padding * idx) + (sectionCount * categoryWidth);
      if (idx === 8) {
        sectionCount++;
      }
      return position;
    })
    .attr("y", data => SVG_HEIGHT - MARGIN.t - yScale(data) - initial_padding_h)
    .attr("fill", (data, idx) => colorScale(idx));

  const categoryLines = graph.selectAll(".line")
    .data(d => { return d.key; })
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (data, idx) => {
      if (idx === 0 || idx === 4) return;
      const xPoint = idx * categoryWidth + initial_padding_w;

      return `M${xPoint},0 L${xPoint},${SVG_HEIGHT - MARGIN.t - initial_padding_h}`;
    });

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${SVG_HEIGHT - initial_padding_h - MARGIN.b + padding})`)
    .call(xAxis);
  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${initial_padding_w - padding},0)`)
    .call(yAxis);

  // Labels
  container.append('text')
    .attr('class', 'label')
    .attr('transform', `translate(${SVG_WIDTH / 2},${SVG_HEIGHT - padding - padding})`)
    .text('Age Groups');
  container.append('text')
    .attr('class', 'label')
    .attr("text-anchor", "middle")
    .attr('transform', `translate(20,${SVG_HEIGHT / 2 - padding}) rotate(270)`)
    .text('Various Mental Illness');

}

