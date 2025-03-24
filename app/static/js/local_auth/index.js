document.addEventListener("DOMContentLoaded", function () {
  fetch('/camp_manager/get_camp_details')
    .then(response => response.json())
    .then(data => {
      if (!data) return;
      
      const numPeoplePresent = data.num_people_present || 0;
      const capacity = data.capacity || 0;
      const foodStockQuota = data.food_stock_quota || 0;
      const foodCapacity = data.food_capacity || 0;
      const waterStockLitres = data.water_stock_litres || 0;
      const clothesRemaining = data.clothes_stock || 0;
      const clothesCapacity = data.clothes_capacity || 0;
      const essentialsRemaining = data.essentials_stock || 0;
      const essentialsCapacity = data.essentials_capacity || 0;
      
      // Update Available Resources Chart
      const availableResourcesChart = new Chart(
        document.getElementById('availableResourcesChart').getContext('2d'),
        {
          type: 'bar',
          data: {
            labels: ['Food', 'Water', 'Clothes', 'Essentials'],
            datasets: [{
              label: 'Available Resources',
              data: [foodStockQuota, waterStockLitres, clothesRemaining, essentialsRemaining],
              backgroundColor: ['#2575fc', '#6a11cb', '#ff6f61', '#28a745'],
            }],
          },
          options: { scales: { y: { beginAtZero: true } } },
        }
      );
      
      // Update Camps List
      const campsList = document.getElementById('camps-list');
      campsList.innerHTML = '';
      data.camps.forEach(camp => {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-camp', camp.camp_name);
        listItem.innerHTML = `<strong>${camp.camp_name}:</strong> ${camp.num_people_present}/${camp.capacity}`;
        campsList.appendChild(listItem);
      });

      // Initialize Map
      const map = L.map('map').setView([12.9716, 77.5946], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      data.camps.forEach(camp => {
        L.marker([camp.latitude, camp.longitude])
          .addTo(map)
          .bindPopup(`${camp.camp_name}: ${camp.num_people_present}/${camp.capacity}`);
      });
    })
    .catch(error => console.error("Error fetching camp details:", error));
});

// Submit Request to Add Warehouse
const submitRequestBtn = document.getElementById('submit-request');
if (submitRequestBtn) {
  submitRequestBtn.addEventListener('click', () => {
    const warehouseName = document.getElementById('warehouse-name').value;
    const warehouseLocation = document.getElementById('warehouse-location').value;
    if (warehouseName && warehouseLocation) {
      alert(`Request Submitted:\nWarehouse Name: ${warehouseName}\nLocation: ${warehouseLocation}`);
    } else {
      alert('Please fill in all fields.');
    }
  });
}
