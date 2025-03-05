// Fake Data for Charts
const userActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'User Activity',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#ff6f61',
      fill: false,
    }]
  };
  
  const sensorStatusData = {
    labels: ['Active', 'Inactive', 'Maintenance'],
    datasets: [{
      label: 'Sensor Status',
      data: [400, 50, 30],
      backgroundColor: ['#2575fc', '#6a11cb', '#ff6f61'],
    }]
  };
  
  // Render Charts
  const userActivityChart = new Chart(document.getElementById('userActivityChart'), {
    type: 'line',
    data: userActivityData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
  
  const sensorStatusChart = new Chart(document.getElementById('sensorStatusChart'), {
    type: 'bar',
    data: sensorStatusData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });