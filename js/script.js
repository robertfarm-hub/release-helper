// ===== TALLENNUS =====

const TALLENNUSAVAIN = 'release-helper-tila';

function lueTila() {
  const tallennettu = localStorage.getItem(TALLENNUSAVAIN);

  if (tallennettu === null) {
    return {};
  }

  return JSON.parse(tallennettu);
}

function tallennaTila(tila) {
  localStorage.setItem(TALLENNUSAVAIN, JSON.stringify(tila));
}


// ===== TEHTÄVÄT =====

const tila = lueTila();
const tehtavat = document.querySelectorAll('.tehtavat input[type="checkbox"]');

tehtavat.forEach(function (checkbox) {
  // Palautus: jos ruutu oli tallennettu ruksattuna, ruksataan se
  if (tila[checkbox.id] === true) {
    checkbox.checked = true;
  }

  // Tallennus: kun ruutu muuttuu, kirjataan uusi tila
  checkbox.addEventListener('change', function () {
    tila[checkbox.id] = checkbox.checked;
    tallennaTila(tila);
  });
});