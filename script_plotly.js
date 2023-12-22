// // Assuming you have already loaded the Plotly library

// // Set the dimensions and margins of the graph
// const margin = { top: 70, right: 60, bottom: 50, left: 80 };
// const width = 1600 - margin.left - margin.right;
// const height = 800 - margin.top - margin.bottom;

// Create a new Plotly layout
// const layout = {
//   title: 'Oil Rate Over Time',
//   xaxis: {
//     title: 'Months',
//   },
//   yaxis: {
//     title: 'Oil Rate (klpd)',
//   },
//   margin: {
//     l: margin.left,
//     r: margin.right,
//     t: margin.top,
//     b: margin.bottom,
//   },
//   showlegend: true,
//   hovermode: 'closest', // To display hover information for the closest data point
//   uirevision: 'true', // To ensure that the zoom is preserved after an update
//   xaxis_type: 'linear', // Necessary for zooming
// };

// // Create an empty array to store data traces
// const dataTraces = [];

// Load data
d3.csv("field_level_history_matching_and_prediction.csv").then(data => {
  data.forEach(d => {
    d["MONTHS"] = +d["MONTHS"];
    d["Oil_pred(klpd)"] = +d["Oil_pred(klpd)"];
    d["Oil_actual(klpd)"] = +d["Oil_actual(klpd)"];
  });

  const filteredData = data.filter(d => !isNaN(d["MONTHS"]) && !isNaN(d["Oil_pred(klpd)"]) && !isNaN(d["Oil_actual(klpd)"]));

  // Create a trace for the predicted oil rate
  const trace1 = {
    x: filteredData.map(d => d["MONTHS"]),
    y: filteredData.map(d => d["Oil_pred(klpd)"]),
    type: 'scatter',
    mode: 'lines',
    name: 'Predicted Oil Rate',
    line: { color: 'black' },
    hoverinfo: 'x+y', // Display x and y values on hover
  };

  // Create a trace for the actual oil rate
  const trace2 = {
    x: filteredData.map(d => d["MONTHS"]),
    y: filteredData.map(d => d["Oil_actual(klpd)"]),
    type: 'scatter',
    mode: 'lines',
    name: 'Actual Oil Rate',
    line: { color: 'green' },
    hoverinfo: 'x+y', // Display x and y values on hover
  };

  // Add the traces to the array
  dataTraces.push(trace1, trace2);

  // Plot the graph using Plotly.newPlot
  const chartContainer = document.getElementById('chart-container');
  Plotly.newPlot(chartContainer, dataTraces, layout);

  // Add event listeners or additional customization as needed

  // Add trackpad zoom
  chartContainer.on('plotly_relayout', function(eventdata) {
    if (eventdata['xaxis.autorange'] || eventdata['yaxis.autorange']) {
      Plotly.relayout(chartContainer, { 'xaxis.autorange': false, 'yaxis.autorange': false });
    }
  });

  // Add double-click zoom out
  chartContainer.addEventListener('dblclick', function() {
    Plotly.relayout(chartContainer, { 'xaxis.autorange': true, 'yaxis.autorange': true });
  });

  // Add tooltip line and custom tooltip format
  chartContainer.on('plotly_hover', function(data) {
    const hoverData = data.points[0];
    if (hoverData) {
      const xValue = hoverData.x;
      const yValue = hoverData.y;
      const month = hoverData.x;
      const actualValue = hoverData.curveNumber === 1 ? yValue : null;
      const predictedValue = hoverData.curveNumber === 0 ? yValue : null;

      // Create a line for the tooltip
      const line = {
        type: 'line',
        x0: xValue,
        x1: xValue,
        y0: 0,
        y1: height,
        line: {
          color: 'black',
          width: 1,
          dash: 'dash',
        },
      };

      // Create a tooltip with the specified format
      const tooltip = {
        x: xValue,
        y: height / 2, // Adjust the y-position as needed
        xref: 'x',
        yref: 'y',
        showarrow: true,
        arrowhead: 4,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: 'black',
        ax: 0,
        ay: -30,
        text: `Actual: ${actualValue !== null ? actualValue.toFixed(2) : 'N/A'}<br>Predicted: ${predictedValue !== null ? predictedValue.toFixed(2) : 'N/A'}<br>Month: ${month}`,
        font: {
          family: 'Arial',
          size: 12,
          color: 'black',
        },
        bordercolor: 'black',
        borderwidth: 1,
        bgcolor: 'white',
        opacity: 0.8,
      };

      // Update the layout to add the line and tooltip
      Plotly.update(chartContainer, { shapes: [line], annotations: [tooltip] });
    }
  });

  // Remove the tooltip when the mouse is not over the plot
  chartContainer.on('plotly_unhover', function() {
    // Update the layout to remove the line and tooltip
    Plotly.update(chartContainer, { shapes: [], annotations: [] });
  });
});
