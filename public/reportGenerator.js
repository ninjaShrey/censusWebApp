function fetchCensusData() {
    return fetch('/generate-report-data')
      .then(response => response.json())
      .catch(error => console.error('Error fetching census data:', error));
  }
  
  function populateTable(data) {
    const reportTableBody = document.querySelector('#report-table tbody');
    reportTableBody.innerHTML = '';
  
    data.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
            <td>${entry.familyType}</td>
            <td>${entry.numMembers}</td>
            <td>${entry.numChildren}</td>
            <td>${entry.annualIncome}</td>
            <td>${entry.numWorkingMembers}</td>
            <td>${entry.sourceIncome}</td>
          `;
      reportTableBody.appendChild(row);
    });
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const generateReportBtn = document.querySelector('#generate-report-btn');
  
    // Event listener for Generate Report button
    generateReportBtn.addEventListener('click', async function() {
      const data = await fetchCensusData();
      populateTable(data);
    });
  });