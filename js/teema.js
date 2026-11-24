// ===== TEEMA =====
// Ladataan headissa ilman deferiä, joten tämä ajetaan heti, ennen kuin sivu piirretään.
// Näin tallennettu teema on käytössä ensimmäisestä hetkestä asti, eikä väärä teema välähdä.

const TEEMAAVAIN = 'release-helper-teema';

function asetaTeema(teema) {
  if (teema === 'vaalea' || teema === 'tumma') {
    document.documentElement.dataset.teema = teema;
  } else {
    document.documentElement.removeAttribute('data-teema');
  }
}

try {
  asetaTeema(localStorage.getItem(TEEMAAVAIN));
} catch (virhe) {
  console.error('Tallennettua teemaa ei voitu lukea', virhe);
}