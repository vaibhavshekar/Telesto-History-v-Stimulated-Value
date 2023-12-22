document.addEventListener('DOMContentLoaded', function () {
  // Declare dataTraces outside of the functions
  const dataTraces = [];
  let defaultPredictedKey = 'Oil_rate(klpd)';
  let defaultActualKey = 'Oil_rate_actual(klpd)';
  let defaultTitle = 'Oil Rate Over Time';

  renderOilPlot();

  document.getElementById('oilLink').addEventListener('click', function () {
    setDefaultKeys('Oil_rate(klpd)', 'Oil_rate_actual(klpd)', 'Oil Rate Over Time');
  });

  document.getElementById('waterLink').addEventListener('click', function () {
    setDefaultKeys('Water_rate(klpd)', 'Water_rate_actual(klpd)', 'Water Rate Over Time');
  });

  document.getElementById('gasLink').addEventListener('click', function () {
    setDefaultKeys('Gas_rate(mscum d)', 'Gas_rate_actual(mscum d)', 'Gas Rate Over Time');
  });

  // Add event listener for the dropdown change event
  document.getElementById('well-select').addEventListener('change', function () {
    const selectedWell = this.value;
    updateGraph(selectedWell, defaultPredictedKey, defaultActualKey, defaultTitle);
  });

  function setDefaultKeys(predictedKey, actualKey, title) {
    defaultPredictedKey = predictedKey;
    defaultActualKey = actualKey;
    defaultTitle = title;

    const selectedWell = document.getElementById('well-select').value;
    updateGraph(selectedWell, defaultPredictedKey, defaultActualKey, defaultTitle);
  }

  function renderOilPlot() {
    console.log(1);
    const margin = { top: 70, right: 60, bottom: 50, left: 80 };
    const width = 1600 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Load the initial graph
    updateDropdown();
  }

  function renderWaterPlot() {
    console.log(2);
    const margin = { top: 70, right: 60, bottom: 50, left: 80 };
    const width = 1600 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Load the initial graph for water
    updateDropdown();
  }

  function renderGasPlot() {
    console.log(3);
    const margin = { top: 70, right: 60, bottom: 50, left: 80 };
    const width = 1600 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Load the initial graph for gas
    updateDropdown();
  }

  function updateGraph(selectedWell, predictedKey, actualKey, title) {
    Plotly.d3.csv('well_level_history_matching_and_prediction.csv', function (csvData) {
      const data = csvData.filter((d) => d['WELL'] === selectedWell);

      if (data.length === 0) {
        console.error('No data for the selected well:', selectedWell);
        return;
      }

      data.forEach((d) => {
        d.MONTHS = +d['Months'];
        d[predictedKey] = +d[predictedKey];
        d[actualKey] = +d[actualKey];
      });

      const hoverTextPredicted = data.map(d => {
        const predictedValue = isNaN(d[predictedKey]) ? 'N/A' : d[predictedKey].toFixed(2);
        const actualValue = isNaN(d[actualKey]) ? 'N/A' : d[actualKey].toFixed(2);
        return `Year: ${d.MONTHS}<br>Actual: ${actualValue}<br>Predicted: ${predictedValue}`;
      });

      let actualDataColor;
      switch (title) {
        case 'Oil Rate Over Time':
          actualDataColor = 'green';
          break;
        case 'Water Rate Over Time':
          actualDataColor = 'blue';
          break;
        case 'Gas Rate Over Time':
          actualDataColor = 'red';
          break;
        default:
          actualDataColor = 'black'; // Default color if none of the above
      }
      
      // Create a trace for the predicted data
      const trace1 = {
        x: data.map((d) => d.MONTHS),
        y: data.map((d) => d[predictedKey]),
        type: 'scatter',
        mode: 'lines',
        name: 'Prediction',
        line: { color: 'black' },
        text: hoverTextPredicted,
        hoverinfo: 'text'
      };

      // Create a trace for the actual data
      const trace2 = {
        x: data.map((d) => d.MONTHS),
        y: data.map((d) => d[actualKey]),
        type: 'scatter',
        mode: 'lines',
        name: 'Actual',
        line: { color: actualDataColor },
        text: hoverTextPredicted,
        hoverinfo: 'text'
      };

      // Add the traces to the array
      dataTraces.length = 0;
      dataTraces.push(trace1, trace2);

      // Plot the graph using Plotly.newPlot
      Plotly.newPlot('chart-container-oil', dataTraces, getLayout(selectedWell, title));
    });
  }

  function updateDropdown() {
    Plotly.d3.csv('well_level_history_matching_and_prediction.csv', function (csvData) {
      const wells = [...new Set(csvData.map((d) => d['WELL']))];
      const dropdown = document.getElementById('well-select');

      // Clear existing options
      dropdown.innerHTML = '';

      wells.forEach((well) => {
        const option = document.createElement('option');
        option.value = well;
        option.text = well;
        dropdown.add(option);
      });

      // Load the initial graph with the first well
      updateGraph(wells[0], defaultPredictedKey, defaultActualKey, defaultTitle);
    });
  }

  function getLayout(selectedWell, title) {
    const margin = { top: 70, right: 60, bottom: 50, left: 80 }; // Add this line

    return {
      title: `${selectedWell} - ${title}`,
      xaxis: {
        title: 'Months',
        type: 'linear',
      },
      yaxis: {
        title: 'Rate',
        type: 'linear',
      },
      margin: {
        l: margin.left,
        r: margin.right,
        t: margin.top,
        b: margin.bottom,
      },
      height: 800,
      showlegend: true,
      hovermode: 'closest',
      uirevision: 'true',
      xaxis_type: 'linear',
      dragmode: 'zoom',
      uirevision: 'true',
      doubleClick: 'reset+autosize',
    };
  }
});
