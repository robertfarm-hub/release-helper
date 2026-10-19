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
    paivitaKaikki(true);
  });
});

// ===== KORTIT JA ALAPALKKI =====

const kortit = document.querySelectorAll('.kortti');

function paivitaKortti(kortti) {
  const ruudut = kortti.querySelectorAll('.tehtavat input[type="checkbox"]');
  const tehdyt = kortti.querySelectorAll('.tehtavat input[type="checkbox"]:checked');
  const kulma = kortti.querySelector('.kuittaa-kaikki');
  const palkinLinkki = document.querySelector('.edistyminen a[href="#' + kortti.id + '"]');

  const kaikkiTehty = tehdyt.length === ruudut.length;
  const osaTehty = tehdyt.length > 0 && !kaikkiTehty;

  kulma.checked = kaikkiTehty;
  kulma.indeterminate = osaTehty;
  palkinLinkki.classList.toggle('tehty', kaikkiTehty);

  return kaikkiTehty;
}

// Kulman "Kaikki tehty" ruksaa tai tyhjentää kortin kaikki tehtävät
kortit.forEach(function (kortti) {
  const kulma = kortti.querySelector('.kuittaa-kaikki');
  const ruudut = kortti.querySelectorAll('.tehtavat input[type="checkbox"]');

  kulma.addEventListener('change', function () {
    ruudut.forEach(function (ruutu) {
      ruutu.checked = kulma.checked;
      tila[ruutu.id] = ruutu.checked;
    });

    tallennaTila(tila);
    paivitaKaikki(true);
  });
});


// ===== ONNITTELUT =====

const valivaihe = document.querySelector('#valivaihe');
const valmis = document.querySelector('#valmis');
const ilmoitus = document.querySelector('#tila-ilmoitus');
const viestiLahetetty = document.querySelector('#vaihe-2-lahetetty');

function naytaOnnittelu(osio, nayta, ilmoita) {
  const oliPiilossa = osio.hidden;
  osio.hidden = !nayta;

  if (ilmoita && oliPiilossa && nayta) {
    const otsikko = osio.querySelector('h2').textContent;
    const teksti = osio.querySelector('p').textContent;
    ilmoitus.textContent = otsikko + ' ' + teksti;
  }
}


// ===== KAIKEN PÄIVITYS =====

function paivitaKaikki(ilmoita) {
  let pakollisetValmiina = true;

  kortit.forEach(function (kortti) {
    const korttiValmis = paivitaKortti(kortti);

    if (!kortti.classList.contains('valinnainen') && !korttiValmis) {
      pakollisetValmiina = false;
    }
  });

  naytaOnnittelu(valivaihe, viestiLahetetty.checked && !pakollisetValmiina, ilmoita);
  naytaOnnittelu(valmis, pakollisetValmiina, ilmoita);
}

// Sivun avautuessa: näytetään tallennettu tilanne ilman ilmoituksia
paivitaKaikki(false);

// ===== LOMAKE JA VIESTI =====

const lomake = document.querySelector('.viestilomake');
const kentat = document.querySelectorAll('.viestilomake [id^="viesti-"]');
const valmisViesti = document.querySelector('#valmis-viesti');
const kopioiNappi = document.querySelector('.kopioi-viesti');
const kopiointiTila = document.querySelector('.kopiointi-tila');
const viestiKopioitu = document.querySelector('#vaihe-2-kopioitu');

function arvo(id) {
  return document.querySelector('#' + id).value.trim();
}

function kokoaViesti() {
  const rivit = [
    'Artisti: ' + arvo('viesti-artisti'),
    'Kappaleen nimi: ' + arvo('viesti-kappale'),
    '',
    'Äänityspaikka: ' + arvo('viesti-paikka'),
    'Äänittäjä: ' + arvo('viesti-aanittaja'),
    '',
    'Sävellys: ' + arvo('viesti-savellys'),
    'Sanoitus: ' + arvo('viesti-sanoitus'),
    'Miksaus: ' + arvo('viesti-miksaus'),
    'Masterointi: ' + arvo('viesti-masterointi')
  ];

  // Valinnaiset kentät vain, jos ne on täytetty
  if (arvo('viesti-esiintyjat') !== '') {
    rivit.push('Muut esiintyjät: ' + arvo('viesti-esiintyjat'));
  }

  if (arvo('viesti-toive') !== '') {
    rivit.push('Toive julkaisupäivästä: ' + arvo('viesti-toive'));
  }

  rivit.push('', 'Pitch-teksti:', arvo('viesti-pitch'), '', 'Materiaali: ' + arvo('viesti-linkki'));

  valmisViesti.value = rivit.join('\n');
}

// Kenttien palautus ja tallennus
kentat.forEach(function (kentta) {
  if (tila[kentta.id] !== undefined) {
    kentta.value = tila[kentta.id];
  }

  kentta.addEventListener('input', function () {
    tila[kentta.id] = kentta.value;
    tallennaTila(tila);
    kokoaViesti();
  });
});

kokoaViesti();

// Kopiointi
kopioiNappi.addEventListener('click', function () {
  if (!lomake.reportValidity()) {
    kopiointiTila.textContent = 'Täytä puuttuvat kentät ennen kopiointia.';
    return;
  }

  navigator.clipboard.writeText(valmisViesti.value)
    .then(function () {
      kopiointiTila.textContent = 'Viesti kopioitu. Liitä se viestiin yhteyshenkilöllesi.';
      viestiKopioitu.checked = true;
      tila[viestiKopioitu.id] = true;
      tallennaTila(tila);
      paivitaKaikki(true);
    })
    .catch(function () {
      valmisViesti.select();
      kopiointiTila.textContent = 'Automaattinen kopiointi ei onnistunut. Viesti on valittuna, kopioi se käsin.';
    });
});