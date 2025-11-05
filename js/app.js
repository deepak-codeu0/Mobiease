const phones = [
  {
    id: 'p1', name: 'Aurora X5', os: 'android', price: 24999, camera: 108, battery: 5000, img: 'assets/aurorax5.png ', desc: 'Flagship-style camera and long battery.'
  },
  {
    id: 'p2', name: 'ZenPhone Lite', os: 'android', price: 14999, camera: 64, battery: 4500, img: 'assets/zenphonelite.png', desc: 'Great value for everyday users.'
  },
  {
    id: 'p3', name: 'iQuasar Mini', os: 'ios', price: 69999, camera: 48, battery: 3200, img: 'assets/iquasarmini.png', desc: 'Compact iOS device with premium feel.'
  },
  {
    id: 'p4', name: 'MegaBattery Pro', os: 'android', price: 27999, camera: 50, battery: 7000, img: 'assets/megabatterypro.png', desc: 'Designed for heavy users and travelers.'
  }
];

const budgetInput = document.getElementById('budget');
const budgetVal = document.getElementById('budget-val');
const osSelect = document.getElementById('os');
const cameraImportance = document.getElementById('camera-importance');
const batteryImportance = document.getElementById('battery-importance');
const applyBtn = document.getElementById('apply');
const resetBtn = document.getElementById('reset');
const resultsList = document.getElementById('results-list');
const tpl = document.getElementById('phone-card-tpl');

// show default range value
budgetVal.textContent = '₹' + Number(budgetInput.value).toLocaleString();

budgetInput.addEventListener('input', ()=>{
  budgetVal.textContent = '₹' + Number(budgetInput.value).toLocaleString();
});

applyBtn.addEventListener('click', ()=>{ applyFilters(); });
resetBtn.addEventListener('click', ()=>{ resetFilters(); });

function resetFilters(){
  budgetInput.value = 30000;
  osSelect.value = 'any';
  cameraImportance.value = '2';
  batteryImportance.value = '2';
  budgetVal.textContent = '₹' + Number(budgetInput.value).toLocaleString();
  renderRecommendations(phones);
}

function applyFilters(){
  const budget = Number(budgetInput.value);
  const os = osSelect.value;
  const camImp = Number(cameraImportance.value);
  const batImp = Number(batteryImportance.value);

  // scoring: lower price and higher specs score better
  const scored = phones.map(p => {
    // base score from inverse price (cheaper -> higher)
    const priceScore = Math.max(0, (1 - p.price / Math.max(budget, p.price)));
    const cameraScore = p.camera / 200; // normalize 0..1
    const batteryScore = p.battery / 8000; // normalize

    // OS match bonus
    const osBonus = (os === 'any' || os === p.os) ? 0.05 : -0.05;

    // weighted sum
    const score = priceScore * 0.4 + cameraScore * (0.3 * camImp) + batteryScore * (0.3 * batImp) + osBonus;

    return {...p, score};
  });

  // filter by budget strictly
  const filtered = scored.filter(p => p.price <= budget);

  // sort by score descending
  filtered.sort((a,b)=> b.score - a.score);

  renderRecommendations(filtered);
}

function renderRecommendations(list){
  resultsList.innerHTML = '';
  if(!list || list.length === 0){
    resultsList.innerHTML = '<p>No matches. Try increasing budget or changing filters.</p>';
    return;
  }

  for(const p of list){
    const node = tpl.content.cloneNode(true);
    node.querySelector('.phone-img').src = p.img;
    node.querySelector('.phone-img').alt = p.name;
    node.querySelector('.phone-name').textContent = p.name;
    node.querySelector('.phone-desc').textContent = p.desc;
    node.querySelector('.spec-os').textContent = p.os;
    node.querySelector('.spec-price').textContent = '₹' + Number(p.price).toLocaleString();
    node.querySelector('.spec-camera').textContent = p.camera + ' MP';
    node.querySelector('.spec-battery').textContent = p.battery;

    const buy = node.querySelector('.buy');
    buy.addEventListener('click', ()=>{
      alert(p.name + '\nPrice: ₹' + p.price.toLocaleString() + '\nOpen external site to buy (demo).');
    });

    const save = node.querySelector('.save');
    save.addEventListener('click', ()=>{
      savePhone(p.id);
      save.textContent = 'Saved';
      save.disabled = true;
    });

    resultsList.appendChild(node);
  }
}

function savePhone(id){
  const key = 'savedPhones_v1';
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  if(!saved.includes(id)) saved.push(id);
  localStorage.setItem(key, JSON.stringify(saved));
}

// initial render
renderRecommendations(phones);
