// Create a new Plotly layout
// const layout = {
//   title: 'Water Rate Over Time',
//   xaxis: {
//     title: 'Date',
//   },
//   yaxis: {
//     title: 'Water Rate (klpd)',
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

// Load data
d3.csv("field_level_history_matching_and_prediction.csv").then(data => {
  data.forEach(d => {
    d["MONTHS"] = +d["MONTHS"];
    d["Water_pred(klpd)"] = +d["Water_pred(klpd)"];
    d["Water_actual(klpd)"] = +d["Water_actual(klpd)"];
  });

  const filteredData = data.filter(d => !isNaN(d["MONTHS"]) && !isNaN(d["Water_pred(klpd)"]) && !isNaN(d["Water_actual(klpd)"]));

  // Create a trace for the predicted Water rate
  const trace1 = {
    x: filteredData.map(d => d["MONTHS"]),
    y: filteredData.map(d => d["Water_pred(klpd)"]),
    type: 'scatter',
    mode: 'lines',
    name: 'Predicted Water Rate',
    line: { color: 'black' },
    hoverinfo: 'x+y', // Display x and y values on hover
  };

  // Create a trace for the actual Water rate
  const trace2 = {
    x: filteredData.map(d => d["MONTHS"]),
    y: filteredData.map(d => d["Water_actual(klpd)"]),
    type: 'scatter',
    mode: 'lines',
    name: 'Actual Water Rate',
    line: { color: 'blue' },
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
