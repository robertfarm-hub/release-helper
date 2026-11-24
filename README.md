# Julkaisuapuri artistille (release-helper)

Opas artistille, joka julkaisee kappaleen yhteyshenkilön kautta (Katutaso / Warner). Sivu käy julkaisun läpi viidessä vaiheessa: materiaalit, viesti yhteyshenkilölle, Spotify-pitch sekä valinnaisina Teosto ja Gramex. Artisti merkitsee tehdyt kohdat, ja sivu kokoaa lomakkeen tiedoista valmiin viestin kopioitavaksi. Merkinnät tallentuvat vain artistin omaan selaimeen, eikä mitään lähetetä minnekään.

Sivu korvaa vanhan PDF-ohjeen, joka oli vanhentunut ja hämmensi osaa artisteista.

- Julkaistu sivu: https://robertfarm-hub.github.io/release-helper/
- Repo: https://github.com/robertfarm-hub/release-helper

## Kansiorakenne

```
release-helper/
├── index.html
├── css/
│   └── styles.css        kaikki tyylit, jaettu @layer-kerroksiin
├── js/
│   ├── teema.js          tallennetun teeman asetus ennen sivun piirtämistä
│   └── script.js         merkinnät, lomake, kopiointi, alapalkki, teemavalikko
└── kuvat/                hahmo (tumma ja vaalea versio, WebP), favicon, jakokuva
```

## Suunnittelupäätökset

### 1. CSS-arkkitehtuuri: tokenit ja @layer-kerrokset

Kaikki värit, välit, fonttikoot, pyöristykset ja varjo ovat `:root`-tasolla muuttujina (`--vari-*`, `--vali-*`, `--fontti-*`, `--pyoristys-*`, `--varjo`). Värimuuttujat on nimetty roolin mukaan (`--vari-korostus`), ei värin mukaan. Tämä testattiin käytännössä: ensimmäinen paletti osoittautui liian voimakkaaksi ja vaihdettiin hillitympään, eikä yhtään CSS-sääntöä tarvinnut muuttaa. Paletti on valittu Palettonista, ja kaikkien tekstiparien kontrasti on vähintään 4,5:1 molemmissa teemoissa.

CSS on jaettu viiteen kerrokseen:

```css
@layer tokenit, perusta, asettelu, komponentit, apuluokat;
```

Myöhempi kerros voittaa aiemman spesifisyydestä riippumatta, joten tyylien järjestys on näkyvissä yhdellä rivillä eikä riipu valitsimien painoarvoista. Apuluokka `.piilotettu` (näkyvistä piilotettu, ruudunlukijalle luettava teksti) on viimeisessä kerroksessa, jotta se toimii varmasti, mihin tahansa elementtiin se lisätään. Hyöty näkyi heti, kun teemavalikon radionapit piilotettiin samalla luokalla. Koko CSS on kerroksissa, koska kerrosten ulkopuolinen CSS voittaisi kaikki kerrokset. Kerrosjako tarkistettiin automaattisella testillä: jokaisen elementin laskettu tyyli oli sama ennen ja jälkeen jaon.

### 2. Asettelutekniikat valittu tehtävän mukaan

- **Grid pinoihin** (main, kortti, lomake, tehtävälistat): välit tulevat `gap`-ominaisuudesta yhdestä paikasta, eikä marginaaleja tarvitse säätää elementtikohtaisesti.
- **Grid kaksiulotteiseen asetteluun** herossa (`grid-template-areas`): otsikko ja iskulause vasemmalla, hahmo oikealla molempien rivien korkeudella.
- **Flexbox yksirivisiin asetteluihin**: kortin yläosa, checkbox ja label, alapalkin numerot, napit sekä Aloita alusta -napin ja teemavalikon rivi (`space-between` ja `flex-wrap`).
- **Container query** korteissa: alle 28rem levyisessä kortissa otsikko siirtyy omalle rivilleen. Raja valittiin sisällön mukaan (pisin otsikko ja "Kaikki tehty" mahtuvat samalle riville), ja ratkaisevaa on kortin oma leveys, ei näytön. Herossa koko kokonaisuus skaalautuu headerin leveyden mukaan container query -yksiköillä (`cqi`), jolloin otsikko ja hahmo pysyvät samassa suhteessa kaikilla leveyksillä.
- **Kortit yhdessä sarakkeessa** eikä `repeat(auto-fit, minmax(...))`: auto-fit sopii samanarvoisille elementeille, joiden järjestyksellä ei ole väliä. Tässä vaiheet luetaan järjestyksessä 1–5, joten rinnakkain asettelu rikkoisi lukujärjestyksen.
- **Media queryt vain alapalkissa**, ja ne riippuvat näkymän muodosta eikä laitetyypistä. Palkilla on kolme tilaa: tavallisesti kiinteä alareunassa, matalassa ja leveässä näkymässä (puhelin vaakatasossa, noin 200 % zoom) pystypalkki oikeassa reunassa ja matalassa ja kapeassa näkymässä (suuri zoom) tavallinen navigaatio headerin alla, koska kiinteä palkki peittäisi silloin suuren osan ruudusta.

### 3. Teemavalinta, joka ei riipu uusista CSS-funktioista

Sivu seuraa oletuksena laitteen teemaa, mutta käyttäjä voi valita vaalean tai tumman teeman. Valikko on sekä sivun ylä- että alaosassa Aloita alusta -napin rinnalla.

- **CSS:** valinta merkitään `<html>`-elementtiin attribuutilla `data-teema`. Laitteen vaalea teema on media queryssä ehdolla `:root:not([data-teema="tumma"])`, ja käyttäjän valitsema vaalea teema on omassa `:root[data-teema="vaalea"]`-säännössään. Uudempaa `light-dark()`-funktiota ei käytetty, koska se on toiminut kaikissa selaimissa vasta toukokuusta 2024, ja tukemattomassa selaimessa sivun kaikki värit katoaisivat. Valitulla tavalla tukiongelmaa ei ole. Hintana vaalean teeman arvot ovat kahdessa kohdassa. `color-scheme` lukitaan valinnan mukaan, jotta myös selaimen omat osat, kuten vierityspalkit, seuraavat teemaa.
- **Valikko:** oikeat radionapit `fieldset`- ja `legend`-elementeissä, joten näppäimistö (Tab ryhmään, nuolet vaihtoehtojen välillä) ja ruudunlukija toimivat ilman lisäkoodia. Radio on piilotettu `.piilotettu`-luokalla, ja näkyvä osa on label. Fokuskehys piirretään labeliin (`input:focus-visible + label`). Valittu vaihtoehto erottuu täytöllä eikä pelkällä värillä. Ylä- ja alaosan ryhmillä on eri `name`-arvot, koska saman nimiset radionapit muodostaisivat yhden kuuden napin ryhmän. JavaScript pitää valikot samassa tilassa.
- **Tallennus:** valinta tallentuu localStorageen omalla avaimellaan (`release-helper-teema`), joten Aloita alusta tyhjentää julkaisun merkinnät mutta jättää teeman ennalleen. Arvo on pelkkää tekstiä eikä JSONia, joten rikkinäinen arvo ei voi kaataa skriptiä, ja muut kuin kelvolliset arvot ohitetaan.
- **Ei välähdystä:** `js/teema.js` ladataan headissa ilman `defer`-attribuuttia ennen CSS:ää, joten tallennettu teema on käytössä ennen kuin sivu piirretään. Tiedosto on pidetty muutaman rivin mittaisena, koska se pysäyttää sivun lukemisen siksi aikaa, kun se ajetaan.
- **Hahmokuva:** `<picture>`-elementin vaalea versio valitaan media-ehdolla, joka seuraisi muuten vain laitteen teemaa. JavaScript vaihtaa ehdon valinnan mukaan.

## Muita ratkaisuja

- **Saavutettavuus:** semanttinen rakenne (header, nav, main, footer, kortit `section`-elementteinä), `:focus-visible`-kehys kaikissa interaktiivisissa osissa, piilotekstit ulkoisille linkeille ("avautuu uuteen välilehteen") ja alapalkin numeroille, `role="status"`-ilmoitukset kopioinnista ja tyhjennyksestä. Tilat erottuvat muullakin kuin värillä: checkboxin tilat muodolla, valinnaiset vaiheet katkoviivalla ja kenttien tilat viivatyypillä.
- **Liike:** kaikki animaatiot ja sujuva vieritys ovat `prefers-reduced-motion: no-preference` -kyselyn sisällä, eli liike on lisä, joka annetaan vain niille, jotka eivät ole sitä kieltäneet.
- **Checkboxit:** oikea `<input type="checkbox">`, jonka ulkoasu on vaihdettu (`appearance: none`). Näppäimistö, ruudunlukija ja label toimivat edelleen. Koko 24 px (pienin suositeltu kosketusalue).
- **Sijoittelu:** `position: absolute` vain Aloita alusta -napin selitteessä (kelluva kerros ei siirrä muuta sisältöä) ja `.piilotettu`-luokassa. Alapalkki on `position: fixed`, ja sen korkeus on yksi muuttuja (`--palkin-korkeus`), jota käytetään myös bodyn alareunan tilana ja `scroll-padding`-arvona, jotta palkki ei peitä sisältöä eikä näppäimistöfokusta.
- **Lomake:** selaimen omat tarkistukset (`required`, `type="url"`, `pattern`, `maxlength`), suomenkieliset virheilmoitukset `data-virhe`-attribuutista ja virhetyyli vasta, kun viestiä on yritetty kopioida.
- **Tallennus:** julkaisun tila on yhtenä JSON-objektina yhden avaimen takana (`release-helper-tila`). Kortin kulman tila, alapalkin valmiit vaiheet ja onnittelut lasketaan aina tallennetuista tiedoista, joten ristiriitaisia tiloja ei voi syntyä.
- **Virheenkäsittely:** tallennetun tilan lukeminen on try/catchissa, ja sekä `getItem` että `JSON.parse` ovat sen sisällä. Rikkinäinen tai väärän muotoinen data (esim. `null` tai taulukko) johtaa tyhjään tilaan, ja virhe kirjataan `console.error`illa. Tallennus ja teeman tallennus on suojattu samoin. Jos selain estää tallennuksen (yleensä estetyt evästeet), käyttäjä saa siitä kerran dialogin, ja sivu toimii muuten normaalisti: viesti kokoutuu ja edistyminen päivittyy, mutta merkinnät eivät säily.
- **Kuvat:** WebP-muoto, `width`- ja `height`-attribuutit (ei sisällön hyppäämistä), hahmolla tyhjä `alt`, koska se on koriste.
- **Ei `!important`ia.** Nappien muunnelmat ovat perusluokan jälkeen, jolloin järjestys ratkaisee.

## Testaus

### Laitteet ja selaimet

| Laite | Käyttöjärjestelmä | Selain | Näyttö |
|---|---|---|---|
| HP ProBook 640 G8 | Windows 11 | Edge | 1920 × 1080, skaalaus 125 % |
| HP ProBook (toinen testaaja) | Windows | Edge | suurempi kuin yllä |
| Nothing Phone (3a) | Android 17, Nothing OS 5.0 | Chrome | pysty ja vaaka |
| Automaattinen testi (Playwright, tekoälyavusteinen) | Linux | Chromium | 1280 × 900, 375 × 800, 800 × 350, 400 × 300, 320 × 256 |

### Tulokset

| Testi | ProBook (oma) | ProBook (toinen) | Nothing Phone | Automaattinen |
|---|---|---|---|---|
| Teemat: laitteen mukaan, vaalea, tumma | ✓ | – | ✓ | ✓ |
| Merkinnät säilyvät, kun sivu suljetaan ja avataan | ✓ | ✓ | ✓ | ✓ |
| Viestin ja pitchin kopiointi | ✓ | – | ✓ | – |
| Aloita alusta tyhjentää merkinnät, teema säilyy | ✓ | – | ✓ | ✓ |
| Vaakataso: alapalkki pystyyn oikeaan reunaan | – | – | ✓ | – |
| Zoom 175 % ja 200 %: alapalkki pystyyn oikeaan reunaan | ✓ | – | – | – |
| Zoom yli 200 %: alapalkki tavalliseksi navigaatioksi headerin alle (suunniteltu toiminta) | ✓ | – | – | – |
| 320 px leveys (vastaa 400 % zoomia): ei vaakavieritystä | – | – | – | ✓ |
| Näppäimistö: Tab koko sivun läpi, fokus näkyy, teemavalikko nuolilla | ✓ | – | – | ✓ (teemavalikko) |
| Reduced motion: ei animaatioita (DevTools → Rendering → prefers-reduced-motion: reduce) | ✓ | – | – | – |
| @layer-jako ei muuttanut ulkoasua (laskettu tyyli ennen ja jälkeen) | – | – | – | ✓ |

Tunnettu rajoitus: Instagramin ja muiden sovellusten sisäinen selain käyttää omaa tallennustilaansa, joten merkinnät eivät näy, jos sivun avaa myöhemmin tavallisessa selaimessa. Sivun yläosassa on tästä huomio.

## Lähteet ja tekijät

- Checkboxin väkäsen muoto (`clip-path: polygon(...)`) ja `appearance: none` -tekniikka: Stephanie Eckles, "Pure CSS Custom Checkbox Style", moderncss.dev.
- `.piilotettu` (visually hidden) -luokka: vakiintunut saavutettavuusmalli.
- Kontrastit: WCAG 2.x:n relative luminance- ja contrast ratio -kaava.
- Hahmokuvat: tekoälyllä (GPT) tehty, oma prompti.
- Toteutuksessa on käytetty apuna tekoälyä (Claude): ratkaisujen suunnittelu, koodin selitykset ja automaattiset testit.

Tekijä: Robert Färm, Keuda, 2026
