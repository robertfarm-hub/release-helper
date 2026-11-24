// ===== TALLENNUS =====

const TALLENNUSAVAIN = 'release-helper-tila';

function lueTila() {
  try {
    const tallennettu = localStorage.getItem(TALLENNUSAVAIN);

    if (tallennettu === null) {
      return {};
    }

    const luettu = JSON.parse(tallennettu);

    // Tilan pitää olla tavallinen objekti: null, luku, teksti tai taulukko ei kelpaa
    if (typeof luettu !== 'object' || luettu === null || Array.isArray(luettu)) {
      return {};
    }

    return luettu;
  } catch (virhe) {
    console.error('Tallennettua tilaa ei voitu lukea', virhe);
    return {};
  }
}

const varoitusDialogi = document.querySelector('#tallennus-estetty');
let varoitusNaytetty = false;

function tallennaTila(tallennettava) {
  try {
    localStorage.setItem(TALLENNUSAVAIN, JSON.stringify(tallennettava));
  } catch (virhe) {
    console.error('Tilaa ei voitu tallentaa', virhe);

    // Varoitus vain ensimmäisellä kerralla, ei jokaisella klikkauksella tai näppäilyllä
    if (!varoitusNaytetty) {
      varoitusNaytetty = true;
      varoitusDialogi.showModal();
    }
  }
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
  const valmiit = {};

  kortit.forEach(function (kortti) {
    valmiit[kortti.id] = paivitaKortti(kortti);
  });

  const viestiValmis = valmiit['vaihe-1'] && valmiit['vaihe-2'];
  const pakollisetValmiina = viestiValmis && valmiit['vaihe-3'];

  naytaOnnittelu(valivaihe, viestiValmis && !pakollisetValmiina, ilmoita);
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
const pitchKopio = document.querySelector('#pitch-kopio');

function arvo(id) {
  return document.querySelector('#' + id).value.trim();
}

function kokoaViesti() {
  const rivit = [
    'Artisti: ' + arvo('viesti-artisti'),
    'Kappaleen nimi: ' + arvo('viesti-kappale'),
    'Minuutin kohta: ' + arvo('viesti-minuutti'),
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
  if (arvo('viesti-osallistujat') !== '') {
    rivit.push('Muut osallistujat: ' + arvo('viesti-osallistujat'));
  }

  if (arvo('viesti-toive') !== '') {
    rivit.push('Toive julkaisupäivästä: ' + arvo('viesti-toive'));
  }

  rivit.push('', 'Pitch-teksti:', arvo('viesti-pitch'), '', 'Materiaali: ' + arvo('viesti-linkki'));

  valmisViesti.value = rivit.join('\n');

  // Sama pitch-teksti vaiheeseen 3 kopioitavaksi
  pitchKopio.value = arvo('viesti-pitch');
}

// Kenttien palautus ja tallennus
kentat.forEach(function (kentta) {
  if (tila[kentta.id] !== undefined) {
    kentta.value = tila[kentta.id];
  }

  kentta.addEventListener('input', function () {
    kentta.setCustomValidity('');
    tila[kentta.id] = kentta.value;
    tallennaTila(tila);
    kokoaViesti();
  });
});

kokoaViesti();

// Omat virheilmoitukset väärin muotoilluille kentille (data-virhe).
// Tyhjästä pakollisesta kentästä selain kertoo itse.
function asetaVirheilmoitukset() {
  kentat.forEach(function (kentta) {
    kentta.setCustomValidity('');

    const vaaraMuoto = kentta.validity.typeMismatch || kentta.validity.patternMismatch;

    if (vaaraMuoto && kentta.dataset.virhe) {
      kentta.setCustomValidity(kentta.dataset.virhe);
    }
  });
}

// Kopiointi
kopioiNappi.addEventListener('click', function () {
  asetaVirheilmoitukset();
  lomake.classList.add('tarkistettu');

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

// Pitch-tekstin kopiointi vaiheessa 3
const kopioiPitchNappi = document.querySelector('.kopioi-pitch');
const pitchIlmoitus = document.querySelector('#pitch-kopiointi-tila');

kopioiPitchNappi.addEventListener('click', function () {
  if (pitchKopio.value === '') {
    pitchIlmoitus.textContent = 'Pitch-teksti puuttuu. Kirjoita se ensin vaiheessa 2.';
    return;
  }

  navigator.clipboard.writeText(pitchKopio.value)
    .then(function () {
      pitchIlmoitus.textContent = 'Pitch-teksti kopioitu. Liitä se Spotify for Artistsin tekstikenttään.';
    })
    .catch(function () {
      pitchKopio.select();
      pitchIlmoitus.textContent = 'Automaattinen kopiointi ei onnistunut. Teksti on valittuna, kopioi se käsin.';
    });
});

// ===== VALINNAISET VAIHEET =====

const valinnaiset = document.querySelector('.valinnaiset');
const valinnaisetLinkit = document.querySelectorAll('a[href="#vaihe-4"], a[href="#vaihe-5"]');

// Linkki Teostoon tai Gramexiin avaa ensin suljetun osion
valinnaisetLinkit.forEach(function (linkki) {
  linkki.addEventListener('click', function () {
    valinnaiset.open = true;
  });
});


// ===== ALOITA ALUSTA =====

const dialogi = document.querySelector('#vahvistus');
const aloitaAlustaNapit = document.querySelectorAll('.aloita-alusta');
const paaotsikko = document.querySelector('h1');

aloitaAlustaNapit.forEach(function (nappi) {
  nappi.addEventListener('click', function () {
    dialogi.returnValue = '';
    dialogi.showModal();
  });
});

dialogi.addEventListener('close', function () {
  if (dialogi.returnValue === 'tyhjenna') {
    tyhjennaKaikki();
  }
});

function tyhjennaKaikki() {
  tehtavat.forEach(function (checkbox) {
    checkbox.checked = false;
    tila[checkbox.id] = false;
  });

  kentat.forEach(function (kentta) {
    kentta.value = '';
    kentta.setCustomValidity('');
    tila[kentta.id] = '';
  });

  lomake.classList.remove('tarkistettu');

  tallennaTila(tila);
  kokoaViesti();
  kopiointiTila.textContent = '';
  pitchIlmoitus.textContent = '';
  valinnaiset.open = false;
  paivitaKaikki(false);

  ilmoitus.textContent = 'Kaikki merkinnät tyhjennetty. Voit aloittaa uuden julkaisun.';
  paaotsikko.focus();
}



// ===== TEEMAVALINTA =====
// TEEMAAVAIN ja asetaTeema() tulevat teema.js:stä, joka ladataan ennen tätä tiedostoa.

const teemaNapit = document.querySelectorAll('.teemavalinta input');
const hahmonLahde = document.querySelector('.hahmo source');

// <picture> valitsee hahmon vaalean version media-ehdon perusteella.
// Ehto vaihdetaan valinnan mukaan, muuten kuva seuraisi aina laitteen teemaa.
const hahmonMedia = {
  laite: '(prefers-color-scheme: light)',
  vaalea: 'all',
  tumma: 'not all'
};

function naytaValittuTeema(teema) {
  // Molemmat valikot (ylä- ja alaosa) samaan tilaan
  teemaNapit.forEach(function (nappi) {
    nappi.checked = nappi.value === teema;
  });

  hahmonLahde.media = hahmonMedia[teema];
}

// Palautus: teema.js on jo asettanut attribuutin, jos teema on tallennettu
naytaValittuTeema(document.documentElement.dataset.teema ?? 'laite');

// Tallennus: kun valinta muuttuu
teemaNapit.forEach(function (nappi) {
  nappi.addEventListener('change', function () {
    const valittu = nappi.value;

    asetaTeema(valittu);
    naytaValittuTeema(valittu);

    try {
      if (valittu === 'laite') {
        localStorage.removeItem(TEEMAAVAIN);
      } else {
        localStorage.setItem(TEEMAAVAIN, valittu);
      }
    } catch (virhe) {
      // Teema vaihtuu silti tämän käynnin ajaksi. Dialogi tulee, kun merkintöjä yritetään tallentaa.
      console.error('Teemaa ei voitu tallentaa', virhe);
    }
  });
});