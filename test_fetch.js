fetch('http://127.0.0.1:8001/api/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ days: 15 })
}).then(r => r.json()).then(data => {
  console.log("Timeline days:", data.days.length);
  console.log("Hospitals day 0:", data.days[0].hospitals.length);
  console.log("First hospital:", data.days[0].hospitals[0]);
}).catch(console.error);
