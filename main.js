// Global Constants
var barToolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([15, 10])
  .html(function (d) {
    return "<h5 class='barValue'>" + d + " %</h5>";
  });



// Utility functions
function convertStringToBoolean(val) {
  if (val === "0") return false;

  return true;
}

function getPercentage(part, total) {
  return +((part / total) * 100).toFixed(2);
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
  "lack_of_concentration",
  "tiredness",
  "hospitalized_for_mental_illness",
  "legally_disabled",
  "gap_in_resume",
  "employment_status",
  "learning_status",
  "food_stamps",
  "section_8_housing",
  "internet_status",
  "live_with_parents",
  "pc_status"
];

const MENTAL_ILLNESS = ['anxiety', 'compulsive_behavior', 'depression', 'lack_of_concentration', 'legally_disabled', 'mood_swings', 'obsessive_thinking', 'panic_attacks', 'tiredness'];

function dataProcessor(data) {
  const cleanedData = {};
  Object.keys(data).forEach(key => {
    const TRANSFORMED_KEY = HEADER_TO_KEY_HASH[key];

    if (TRANSFORMED_KEY === "unemployment_status") return;

    if (NUMERICAL_KEYS.includes(TRANSFORMED_KEY)) {
      cleanedData[TRANSFORMED_KEY] = +data[key];
    } else if (BOOLEAN_KEYS.includes(TRANSFORMED_KEY)) {
      cleanedData[TRANSFORMED_KEY] = convertStringToBoolean(data[key]);
    } else {
      cleanedData[TRANSFORMED_KEY] = data[key];
    }

    // Special condition for checking mental health status
    MENTAL_ILLNESS.forEach(illness => {
      if (!cleanedData.mental_illness_status && cleanedData[illness]) {
        cleanedData.mental_illness_status = true;
      }
    });
  });

  return cleanedData;
}

const MARGIN = {
  l: 10,
  r: 10,
  t: 10,
  b: 10
};

d3.csv('data.csv', dataProcessor).then((data) => {
  // Globally Initializing Dataset
  mentalHealthData = data;
  maxMentalIllnessCount = 0;
  maxUnemploymentCount = 0;
  maxMentalIllnessAndUnemployedCount = 0;
  maxMentalIllnessAndEmployedCount = 0;

  // Updating maximum counts
  mentalHealthData.forEach(item => {
    const { mental_illness_status, employment_status } = item;
    if (mental_illness_status) {
      maxMentalIllnessCount += 1;
    }
    if (!employment_status) {
      maxUnemploymentCount += 1;
    }
    if (!employment_status && mental_illness_status) {
      maxMentalIllnessAndUnemployedCount += 1;
    }
    if (employment_status && mental_illness_status) {
      maxMentalIllnessAndEmployedCount += 1;
    }
  });

  console.log(maxMentalIllnessAndEmployedCount, maxMentalIllnessAndUnemployedCount, maxMentalIllnessCount, maxUnemploymentCount);

  // generateTask4_8();
  generateTask5_4();
});

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
  // Task 5-4 - Bar Chart for Various Mental Illness vs Age groups for Unemployed Folks

  // Data Pracessing
  const filteredData = mentalHealthData.map(item => {
    return [item.age, item.mental_illness_status, item.employment_status, item.anxiety, item.compulsive_behavior, item.depression, item.lack_of_concentration, item.legally_disabled, item.mood_swings, item.obsessive_thinking, item.panic_attacks, item.tiredness];
  });

  const nestedData = d3.nest()
    .key(data => data[0])
    .rollup(values => {
      const temp = [];

      for (let i = 1; i < 12; i++) {
        const total = d3.sum(values, data => {
          if (i === 2 && !data[i]) return !data[i];
          if (!data[2] && data[i]) return data[i];
        });

        temp.push(total);
      }

      const result = temp.map((item, idx) => {
        if (idx > 1) {
          return getPercentage(item, temp[0]);
        }
      }).slice(2);

      return result
    })
    .entries(filteredData);

  console.log(nestedData);

  // Draw graph
  const categoryWidth = 250;
  const padding = 20;
  const SVG_WIDTH = (categoryWidth * 4) + (padding * 2);
  const SVG_HEIGHT = 300 + (padding * 3);
  const ageGroups = ['18-29', '30-44', '45-59', '>60'];

  // Scales
  const barScale = d3.scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9])
    .range([0, categoryWidth])
    .paddingInner(0.2)
    .paddingOuter(0.25)
    .align(0.5)
    .round(true);
  const ageRangeValues = [0, 1, 2, 3, 4, 5].map((age) => {
    if (!age) return age;
    if (age === 5) return categoryWidth * 4 - (MARGIN.l);
    return (categoryWidth * (age - 1)) + (categoryWidth / 2);
  });
  const ageGroupScale = d3.scaleOrdinal()
    .domain(['', ...ageGroups, ''])
    .range(ageRangeValues);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([2, SVG_HEIGHT - (padding * 3)])
    .nice();
  const inverseYScale = d3.scaleLinear()
    .domain([0, 100])
    .range([SVG_HEIGHT - (padding * 3), 2])
    .nice();
  const colorScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(d3.schemeTableau10);

  const container = d3.select("#main")
    .append("svg")
    .attr("class", "graph_3_container")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  container.call((barToolTip));

  const graph = container.selectAll(".graph_3")
    .data(nestedData)
    .enter()
    .append("g")
    .attr("class", "graph_3");

  let sectionCount = 0;
  function getXValues(idx) {
    if (idx === 8) {
      sectionCount += 1;
      return barScale(idx + 1) + ((sectionCount - 1) * categoryWidth) + (padding * 2);
    }

    return barScale(idx + 1) + (sectionCount * categoryWidth) + (padding * 2);
  }

  const bars = graph.selectAll(".bar")
    .data(d => [...d.value])
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", barScale.bandwidth())
    .attr("height", data => yScale(data))
    .attr("x", (data, idx) => getXValues(idx))
    .attr("y", (data) => {
      return inverseYScale(data) + padding - 2;
    })
    .attr("fill", (data, idx) => colorScale(idx))
    .on('mouseover', function (data) {
      barToolTip.show(data);
      const hoveredElement = d3.select(this);

      hoveredElement.classed('barHover', true);

      hoveredElement.append('text')
        .attr('class', 'barValue')
        .attr('dx', '1em')
        .attr('dy', '-2em')
        .text(`${data} %`);
    })
    .on('mouseout', function (data) {
      barToolTip.hide(data);
      const hoveredElement = d3.select(this);
      hoveredElement.classed('barHover', false)
        .select('text.barValue').remove();
    });

  const categoryLines = graph.selectAll(".line")
    .data([1, 2, 3])
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (data, idx) => {
      const xPoint = categoryWidth + (categoryWidth * idx) + (padding * 2);
      return `M${xPoint},${padding + 2} L${xPoint},${SVG_HEIGHT - (padding * 2)}`;
    });

  // Axes
  const xAxis = d3.axisBottom(ageGroupScale);
  const yAxis = d3.axisLeft(inverseYScale);

  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${padding * 2},${SVG_HEIGHT - (padding * 2)})`)
    .call(xAxis);
  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${padding * 2},${padding - 2})`)
    .call(yAxis);

  // Labels
  container.append('text')
    .attr('class', 'label')
    .attr('transform', `translate(${SVG_WIDTH / 2},${SVG_HEIGHT - padding})`)
    .text('Age Groups');
  container.append('text')
    .attr('class', 'label')
    .attr("text-anchor", "middle")
    .attr('transform', `translate(${10},${SVG_HEIGHT / 2 - padding}) rotate(270)`)
    .text('Various Mental Illness');

}