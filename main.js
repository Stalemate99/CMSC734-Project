// Global Constants
let currentView = 1;

var barToolTip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([15, 10])
  .html(function (d) {
    return "<h5 class='barValue'>" + d + " %</h5>";
  });

var radarToolTip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([100, 0])
  .html(function (data) {
    const { info, label, value } = data;

    return `
    <div class="radarTooltip-container">
      <div class="radarTooltip-left">
        <h4>${label}</h4>
        <p>${info}</p>
      </div>
      <div class="radarTooltip-divider"></div>
      <p class="radarTooltip-value">${value} %</p>
    </div>
    `;
  });

// Utility functions
function convertStringToBoolean(val) {
  if (val === "0") return false;

  return true;
}

function getPercentage(part, total) {
  return +((part / total) * 100).toFixed(2);
}

function getDatefromMonthYear(value) {
  const [month, year] = value.split("-");
  const MONTH_TO_NUMBER = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  return new Date(+`20${year}`, MONTH_TO_NUMBER[month], 1);
}

const HEADER_TO_KEY_HASH = {
  "I am currently employed at least part-time": "employment_status",
  "I identify as having a mental illness": "mental_illness_status",
  Education: "education",
  "I have my own computer separate from a smart phone": "pc_status",
  "I have been hospitalized before for my mental illness":
    "hospitalized_for_mental_illness",
  "How many days were you hospitalized for your mental illness":
    "hospitalized_for_mental_illness_days",
  "I am legally disabled": "legally_disabled",
  "I have my regular access to the internet": "internet_status",
  "I live with my parents": "live_with_parents",
  "I have a gap in my resume": "gap_in_resume",
  "Total length of any gaps in my resume in months.": "gap_in_resume_length",
  "Annual income (including any social welfare programs) in USD":
    "total_annual_income",
  "I am unemployed": "unemployment_status",
  "I read outside of work and school": "learning_status",
  "Annual income from social welfare programs": "annual_income_social_welfare",
  "I receive food stamps": "food_stamps",
  "I am on section 8 housing": "section_8_housing",
  "How many times were you hospitalized for your mental illness":
    "hospitalized_for_mental_illness_count",
  "Lack of concentration": "lack_of_concentration",
  Anxiety: "anxiety",
  Depression: "depression",
  "Obsessive thinking": "obsessive_thinking",
  "Mood swings": "mood_swings",
  "Panic attacks": "panic_attacks",
  "Compulsive behavior": "compulsive_behavior",
  Tiredness: "tiredness",
  Age: "age",
  Gender: "gender",
  "Household Income": "household_income",
  Region: "region",
  "Device Type": "device_type",
};

const NUMERICAL_KEYS = [
  "total_annual_income",
  "annual_income_social_welfare",
  "gap_in_resume_length",
  "hospitalized_for_mental_illness_count",
  "hospitalized_for_mental_illness_days",
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
  "pc_status",
];

const MENTAL_ILLNESS = [
  "anxiety",
  "compulsive_behavior",
  "depression",
  "lack_of_concentration",
  "legally_disabled",
  "mood_swings",
  "obsessive_thinking",
  "panic_attacks",
  "tiredness",
];

function dataProcessor(data) {
  const cleanedData = {};
  Object.keys(data).forEach((key) => {
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
    MENTAL_ILLNESS.forEach((illness) => {
      if (!cleanedData.mental_illness_status && cleanedData[illness]) {
        cleanedData.mental_illness_status = true;
      }
    });
  });

  return cleanedData;
}

function unemploymentRatePreprocessor(data) {
  return {
    date: getDatefromMonthYear(data["Month"]),
    rate: +data["Unemployment Rate"],
  };
}

const MARGIN = {
  l: 10,
  r: 10,
  t: 10,
  b: 10,
};

d3.csv("data.csv", dataProcessor).then((data) => {
  // Globally Initializing Dataset
  mentalHealthData = data;
  maxMentalIllnessCount = 0;
  maxUnemploymentCount = 0;
  maxMentalIllnessAndUnemployedCount = 0;
  maxMentalIllnessAndEmployedCount = 0;

  // Updating maximum counts
  mentalHealthData.forEach((item) => {
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

  console.log(
    maxMentalIllnessAndEmployedCount,
    maxMentalIllnessAndUnemployedCount,
    maxMentalIllnessCount,
    maxUnemploymentCount
  );

  generateRadarPlot();
  generateBarPlot();
  generateDecisionTree();
});

d3.csv('unemploymentRate.csv', unemploymentRatePreprocessor).then((data) => {
  unemplymentData = data;

  // Graph constants
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 600;
  const padding = 50;
  const totalUnemploymentData = unemplymentData.length;
  const finalValue = unemplymentData[totalUnemploymentData - 1];

  // Preparing Scales
  const rateExtent = d3.extent(unemplymentData, (data) => data.rate);
  const rateScale = d3.scaleLinear()
    .domain(rateExtent)
    .range([SVG_HEIGHT - padding, MARGIN.t]);
  const timeExtent = d3.extent(unemplymentData, (data) => data.date);
  const timeScale = d3.scaleTime()
    .domain(timeExtent)
    .range([padding, SVG_WIDTH - MARGIN.t]);

  const timeFormat = d3.timeFormat("%b %Y");
  // Axes
  const xAxis = d3.axisBottom(timeScale)
    .tickFormat(timeFormat)
    .ticks(8);
  const yAxis = d3.axisLeft(rateScale);


  // Draw graph
  const container = d3.select("#line")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("class", "graph_1_container")
    .style("border", "2px solid black")
    .style("margin", MARGIN.t);

  d3.selectAll(".graph_1_container")
    .append("g")
    .attr("class", "xlineAxis")
    .attr("transform", `translate(${0},${SVG_HEIGHT - padding})`)
    .call(xAxis);
  d3.selectAll(".graph_1_container")
    .append("g")
    .attr("class", "ylineAxis")
    .attr("transform", `translate(${padding}, ${0})`)
    .call(yAxis);

  container.append("path")
    .datum(unemplymentData)
    .attr("fill", "none")
    .attr("stroke", "skyblue")
    .attr("stroke-width", 1.5)
    .attr("opacity", 1)
    .attr("d", d3.line()
      .x((data) => timeScale(data.date))
      .y((data) => rateScale(data.rate)));

  const circles = container.append("circle")
    .attr("fill", "royalblue")
    .attr("stroke", "black")
    .attr("stroke-width", "0.8")
    .attr("cx", timeScale(finalValue.date))
    .attr("cy", rateScale(finalValue.rate))
    .attr("r", 3);

  container.append("text")
    .attr("x", timeScale(finalValue.date))
    .attr("y", rateScale(finalValue.rate) - MARGIN.t)
    .attr("text-anchor", "end")
    .style("font-weight", "bold")
    .text(`Current Unemployment Rate: ${finalValue.rate}%`);

  // Labels
  container.append('text')
    .attr('class', 'label')
    .attr('transform', `translate(${(SVG_WIDTH / 2)},${SVG_HEIGHT - (padding / 2) + MARGIN.t})`)
    .style("font-weight", "bold")
    .text('Year');

  container.append('text')
    .attr('class', 'label')
    .attr("text-anchor", "middle")
    .attr('transform', `translate(${padding / 2},${(SVG_HEIGHT / 2) - padding}) rotate(270)`)
    .style("font-weight", "bold")
    .text('Unemployment Rates (%)');
});

// Radar Plot

function generateRadarPlot() {
  // Task 4-8 Radar plot depicting various socioeconomic factors and
  // MH illness percentages in each category.

  // Data Processing
  const SOCIOECONOMIC_FACTORS = [
    "education_status",
    "unemployed_status",
    "food_stamps",
    "internet_status",
    "live_with_parents",
    "section_8_housing",
  ];
  const COMPLETED_EDUCATION = [
    "Completed Masters",
    "Completed Phd",
    "Completed Undergraduate",
    "Some Phd",
    "Some Masters",
  ];
  const socioeconomicFactorsLabelMap = {
    education_status: {
      label: "Educated",
      info: "Percentage of population who have completed an undergradute program and have mental illness.",
    },
    unemployed_status: {
      label: "Unemployed",
      info: "Percentage of population who are unemployed and have mental illness.",
    },
    food_stamps: {
      label: "Use Food Stamps",
      info: "Percentage of population who use food stamps and have mental illness.",
    },
    internet_status: {
      label: "Internet Access",
      info: "Percentage of population who have internet access and have mental illness.",
    },
    live_with_parents: {
      label: "Live with parents",
      info: "Percentage of population who live their parents and have mental illness.",
    },
    section_8_housing: {
      label: "Live in Section 8 Housing",
      info: "Percentage of population who liive in a section 8 housing and have mental illness.",
    },
  };

  const filteredData = [];
  const totalData = [];
  mentalHealthData.forEach((item) => {
    const data = {
      education_status: COMPLETED_EDUCATION.includes(item.education)
        ? true
        : false,
      unemployed_status: item.employment_status ? false : true,
      food_stamps: item.food_stamps,
      internet_status: item.internet_status,
      live_with_parents: item.live_with_parents,
      section_8_housing: item.section_8_housing,
    };
    if (item.mental_illness_status) filteredData.push(data);
    totalData.push(data);
  });

  const graphData = {};
  // Out of X people under the category, Y are mentally ill
  // SOCIOECONOMIC_FACTORS.forEach(category => {
  //   const mentalIllnessCount = d3.sum(filteredData, (data => data[category]));
  //   const totalCount = d3.sum(totalData, (data => data[category]))
  //   graphData[category] = getPercentage(mentalIllnessCount, totalCount);
  // });
  // Out of X mentally ill people Y are in this category
  SOCIOECONOMIC_FACTORS.forEach((category) => {
    const mentalIllnessCount = d3.sum(filteredData, (data) => data[category]);
    graphData[category] = getPercentage(
      mentalIllnessCount,
      maxMentalIllnessCount
    );
  });

  console.log(graphData);

  // Draw graph
  const SVG_WIDTH = 700;
  const SVG_HEIGHT = 700;
  const plotWidth = SVG_WIDTH - 100;
  const plotHeight = SVG_HEIGHT - 100;
  const softPadding = 10;
  const padding = 20;

  // Scales
  const percentageToRadialScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 10]);
  const radialScale = d3
    .scaleLinear()
    .domain([0, 10])
    .range([0, plotWidth / 2])
    .nice();
  const ticks = [2, 4, 6, 8, 10];

  // Utility Functions
  function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return { x: SVG_WIDTH / 2 + x, y: SVG_HEIGHT / 2 - y };
  }

  function getPathCoordinates() {
    let coordinates = [];
    Object.keys(graphData).forEach((category, idx) => {
      const angle =
        Math.PI / 2 + (2 * Math.PI * idx) / SOCIOECONOMIC_FACTORS.length;
      coordinates.push(
        angleToCoordinate(angle, percentageToRadialScale(graphData[category]))
      );
    });

    return coordinates;
  }

  const graphPlotData = [...getPathCoordinates(), getPathCoordinates()[0]];

  // Drawing Graph
  const line = d3
    .line()
    .x((data) => data.x)
    .y((data) => data.y);
  const container = d3
    .select("#radar")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  const backgroundCircles = container
    .selectAll("circle")
    .data(ticks)
    .enter()
    .append("circle")
    .attr("cx", SVG_WIDTH / 2)
    .attr("cy", SVG_HEIGHT / 2)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("r", (data) => radialScale(data));

  const radarPath = container
    .datum(graphPlotData)
    .append("path")
    .attr("d", line)
    .attr("stroke-width", 3)
    .attr("stroke", "red")
    .attr("fill", "lightsalmon")
    .attr("opacity", 0.75);

  // Axes
  const axesData = Object.keys(graphData).map((category, idx) => {
    let angle =
      Math.PI / 2 + (Math.PI * 2 * idx) / Object.keys(graphData).length;
    return {
      name: socioeconomicFactorsLabelMap[category].label,
      angle,
      line_coord: angleToCoordinate(angle, 10),
      label_coord: angleToCoordinate(angle, 10.5),
      value: graphData[category],
    };
  });

  const axisLines = container
    .selectAll("line")
    .data(axesData)
    .enter()
    .append("line")
    .attr("x1", SVG_WIDTH / 2)
    .attr("y1", SVG_HEIGHT / 2)
    .attr("x2", (data) => data.line_coord.x)
    .attr("y2", (data) => data.line_coord.y)
    .attr("stroke", "black")
    // .attr("stroke-width", 1)
    .on("mouseover", function (data, idx) {
      const currentCategory = SOCIOECONOMIC_FACTORS[idx];
      const categoryData = socioeconomicFactorsLabelMap[currentCategory];
      radarToolTip.show({
        label: categoryData.label,
        info: categoryData.info,
        value: data.value,
      });
      const hoveredElement = d3.select(this);

      hoveredElement.classed("radarHover", true);
    })
    .on("mouseout", function (data) {
      radarToolTip.hide();
      const hoveredElement = d3.select(this);
      hoveredElement
        .classed("radarHover", false)
        .select("text.radarHover")
        .remove();
    });

  axisLines.call(radarToolTip);

  // Labels
  const backgroundCircleLabels = container
    .selectAll(".bgCircleLabel")
    .data(ticks)
    .enter()
    .append("text")
    .attr("class", "bgCircleLabel")
    .attr("x", SVG_WIDTH / 2 + 5)
    .attr("y", (data) => SVG_HEIGHT / 2 - radialScale(data) + padding)
    .text((data) => `${data}0%`);

  const axesLabel = container
    .selectAll(".axesLabel")
    .data(axesData)
    .enter()
    .append("text")
    .attr("class", "axesLabel")
    .attr("x", (data) => data.label_coord.x)
    .attr("y", (data) => data.label_coord.y)
    .attr("text-anchor", "middle")
    .attr("transform", (data, idx) => {
      if (idx === 1 || idx === 4) {
        return `rotate(${-60}, ${data.label_coord.x}, ${data.label_coord.y})`;
      } else if (idx === 2 || idx === 5) {
        return `rotate(${60}, ${data.label_coord.x}, ${data.label_coord.y})`;
      }
    })
    .text((data) => data.name);
}

// Bar Plot

function generateBarPlot() {
  // Task 5-4 - Bar Chart for Various Mental Illness vs Age groups for Unemployed Folks

  // Data Pracessing
  const filteredData = mentalHealthData.map((item) => {
    return [
      item.age,
      item.mental_illness_status,
      item.employment_status,
      item.anxiety,
      item.compulsive_behavior,
      item.depression,
      item.lack_of_concentration,
      item.legally_disabled,
      item.mood_swings,
      item.obsessive_thinking,
      item.panic_attacks,
      item.tiredness,
    ];
  });

  const nestedData = d3
    .nest()
    .key((data) => data[0])
    .rollup((values) => {
      const temp = [];

      for (let i = 1; i < 12; i++) {
        const total = d3.sum(values, (data) => {
          if (i === 2 && !data[i]) return !data[i];
          if (!data[2] && data[i]) return data[i];
        });

        temp.push(total);
      }

      const result = temp
        .map((item, idx) => {
          if (idx > 1) {
            return getPercentage(item, temp[0]);
          }
        })
        .slice(2);

      return result;
    })
    .entries(filteredData);

  console.log(nestedData);

  // Draw graph
  const categoryWidth = 250;
  const padding = 20;
  const SVG_WIDTH = categoryWidth * 4 + padding * 2;
  const SVG_HEIGHT = 300 + padding * 3;
  const ageGroups = ["18-29", "30-44", "45-59", ">60"];

  // Scales
  const barScale = d3
    .scaleBand()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9])
    .range([0, categoryWidth])
    .paddingInner(0.2)
    .paddingOuter(0.25)
    .align(0.5)
    .round(true);
  const ageRangeValues = [0, 1, 2, 3, 4, 5].map((age) => {
    if (!age) return age;
    if (age === 5) return categoryWidth * 4 - MARGIN.l;
    return categoryWidth * (age - 1) + categoryWidth / 2;
  });
  const ageGroupScale = d3
    .scaleOrdinal()
    .domain(["", ...ageGroups, ""])
    .range(ageRangeValues);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([2, SVG_HEIGHT - padding * 3])
    .nice();
  const inverseYScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([SVG_HEIGHT - padding * 3, 2])
    .nice();
  const colorScale = d3
    .scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(d3.schemeTableau10);

  const container = d3
    .select("#bar")
    .append("svg")
    .attr("class", "graph_3_container")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .style("margin", MARGIN.t);

  container.call(barToolTip);

  const graph = container
    .selectAll(".graph_3")
    .data(nestedData)
    .enter()
    .append("g")
    .attr("class", "graph_3");

  let sectionCount = 0;
  function getXValues(idx) {
    if (idx === 8) {
      sectionCount += 1;
      return (
        barScale(idx + 1) + (sectionCount - 1) * categoryWidth + padding * 2
      );
    }

    return barScale(idx + 1) + sectionCount * categoryWidth + padding * 2;
  }

  const bars = graph
    .selectAll(".bar")
    .data((d) => [...d.value])
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("width", barScale.bandwidth())
    .attr("height", (data) => yScale(data))
    .attr("x", (data, idx) => getXValues(idx))
    .attr("y", (data) => {
      return inverseYScale(data) + padding - 2;
    })
    .attr("fill", (data, idx) => colorScale(idx))
    .on("mouseover", function (data) {
      barToolTip.show(data);
      const hoveredElement = d3.select(this);

      hoveredElement.classed("barHover", true);
    })
    .on("mouseout", function (data) {
      barToolTip.hide();
      const hoveredElement = d3.select(this);
      hoveredElement
        .classed("barHover", false)
        .select("text.barValue")
        .remove();
    });

  const categoryLines = graph
    .selectAll(".line")
    .data([1, 2, 3])
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (data, idx) => {
      const xPoint = categoryWidth + categoryWidth * idx + padding * 2;
      return `M${xPoint},${padding + 2} L${xPoint},${SVG_HEIGHT - padding * 2}`;
    });

  // Axes
  const xAxis = d3.axisBottom(ageGroupScale);
  const yAxis = d3.axisLeft(inverseYScale);

  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${padding * 2},${SVG_HEIGHT - padding * 2})`)
    .call(xAxis);
  d3.selectAll(".graph_3_container")
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${padding * 2},${padding - 2})`)
    .call(yAxis);

  // Labels
  container
    .append("text")
    .attr("class", "label")
    .attr("transform", `translate(${SVG_WIDTH / 2},${SVG_HEIGHT - padding})`)
    .text("Age Groups");
  container
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      `translate(${10},${SVG_HEIGHT / 2 - padding}) rotate(270)`
    )
    .text("Various Mental Illness");

  // Event Handling
  d3.select("#barSlider-prev").on("click", () => {
    // Go to previous state only for existing views
    currentView--;

    if (currentView >= 1) {
      let range = [(currentView - 1) * 9, currentView * 9 - 1];
      d3.selectAll(".bar")
        .classed("focus", (data, idx) => {
          if (idx >= range[0] && idx <= range[1]) {
            return true;
          }

          return false;
        })
        .classed("unfocus", (data, idx) => {
          if (idx < range[0] || idx > range[1]) {
            return true;
          }

          return false;
        });
    } else {
      currentView++;
    }
  });

  d3.select("#barSlider-next").on("click", () => {
    // Go to next state only for existing views
    currentView++;
    if (currentView <= 4) {
      let range = [(currentView - 1) * 9, currentView * 9 - 1];
      d3.selectAll(".bar")
        .classed("focus", (data, idx) => {
          if (idx >= range[0] && idx <= range[1]) {
            return true;
          }

          return false;
        })
        .classed("unfocus", (data, idx) => {
          if (idx < range[0] || idx > range[1]) {
            return true;
          }

          return false;
        });
    } else if (currentView === 5) {
      d3.selectAll(".bar").classed("focus", true).classed("unfocus", false);
    } else {
      currentView--;
    }
  });
}

// Decision Tree

let treeData = {
  name: "Start",
  parent: null,
  children: [
    {
      name: "Above US Median >= $25,000",
      children: [
        {
          name: "Undergraduate Incomplete/In Progress",
          children: [
            {
              name: "Unemployed",
              children: [
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(20 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(6 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
            {
              name: "Employed",
              children: [
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(56 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(15 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Completed Undergraduate Atleast",
          children: [
            {
              name: "Employed",
              children: [
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(22 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(82 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
            {
              name: "Unemployed",
              children: [
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(6 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(27 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Below US Median < $25,000",
      parent: null,
      children: [
        {
          name: "Undergraduate Incomplete/In Progress",
          children: [
            {
              name: "Employed",
              children: [
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(22 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(10 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
            {
              name: "Unemployed",
              children: [
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(12 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(16 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Completed Undergraduate Atleast",
          children: [
            {
              name: "Unemployed",
              children: [
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(14 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(6 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
            {
              name: "Employed",
              children: [
                {
                  name: "Mentally Unhealthy",
                  children: [
                    { name: Math.round(3 * 0.3) + "%", children: null },
                  ],
                },
                {
                  name: "Mentally Healthy",
                  children: [
                    { name: Math.round(17 * 0.3) + "%", children: null },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
function generateDecisionTree() {
  let margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = 1204 - margin.left - margin.right,
    height = 968 - margin.top - margin.bottom;

  let svg = d3
    .select("#decisionTree")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let i = 0,
    duration = 750,
    root;

  let treemap = d3.tree().size([height, width]);

  root = d3.hierarchy(treeData, function (d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  update(root);

  function expand(d) {
    var children = d.children ? d.children : d._children;
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    if (children) children.forEach(expand);
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function expandAll() {
    expand(root);
    update(root);
  }

  function collapseAll() {
    root.children.forEach(collapse);
    collapse(root);
    update(root);
  }
  function update(source) {
    // Assigns the x and y position for the nodes
    let treeData = treemap(root);

    // Compute the new tree layout.
    let nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
      d.y = d.depth * 180;
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    let node = svg.selectAll("g.node").data(nodes, function (d) {
      return d.id || (d.id = ++i);
    });

    // Enter any new modes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    // Add Circle for the nodes
    nodeEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", 1e-6)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    // Add labels for the nodes
    nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("x", function (d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) {
        return d.data.name;
      });

    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    // Update the node attributes and style
    nodeUpdate
      .select("circle.node")
      .attr("r", 10)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .attr("cursor", "pointer");

    // Remove any exiting nodes
    let nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select("circle").attr("r", 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // ****************** links section ***************************

    // Update the links...
    let link = svg.selectAll("path.link").data(links, function (d) {
      return d.id;
    });

    // Enter any new links at the parent's previous position.
    let linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", function (d) {
        let o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    // UPDATE
    let linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        return diagonal(d, d.parent);
      });

    // Remove any exiting links
    let linkExit = link
      .exit()
      .transition()
      .duration(duration)
      .attr("d", function (d) {
        let o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;

      return path;
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
  }
  collapseAll();
  d3.select("#expand-full").on("click", expandAll);
  d3.select("#collapse-full").on("click", collapseAll);
}
