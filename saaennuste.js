Vue.component('saa-item', {
  props: ['saa'],
  template: `<div valign='top'  >
                <p align='center'> {{ saa.kellonaika }} </p>
                <img :src="saa.kuvanosoite" align='center'></img> 

                <p v-if="saa.lampotila.arvo < 0" class="miinusAsteita" align='center'> {{ saa.lampotila.arvo }} {{ saa.lampotila.yksikko }} </p>
                <p v-if="saa.lampotila.arvo > 0" class="plusAsteita" align='center'> +{{ saa.lampotila.arvo }} {{ saa.lampotila.yksikko }}</p>

                <p v-if="saa.tuuli.arvo > 6" align='center'> {{ saa.tuuli.arvo }} {{saa.tuuli.yksikko}}
                  <img src="https://www.freeiconspng.com/uploads/alert-icon-red-11.png" width=20px align='top'></img>
                </p>
                <p v-else align='center'> {{ saa.tuuli.arvo }} {{saa.tuuli.yksikko}}
                </p>
            </div>`,
})//tuulen raja laitettu oman mieltymyksen mukaan, ei perustu oikeisiin määräyksiin


Vue.component('saaennuste', {
  template: `<h1>Sääennuste</h1>`
})

var app = new Vue({
  el: '#app',
  data: {
    paikkakunta: '',
    saa:[{
      paiva:'',
      kellonaika:'',
      tuuli:[{
        arvo:'',
        yksikko:'',
      }],
      lampotila:[{
        arvo:'',
        yksikko:'',
      }],
      ikoni:'',
      kuvanosoite:'',
      id: '',
    }],
    tamaPaiva:'',
    paivamaarat:[{
      paivamaara:'',
      viikonpaiva:'',
    }],
    valittuPaiva: '',
    virheilmoitus:'',
  },

  methods: {
    getAnswer: function () {
      axios.get('https://api.openweathermap.org/data/2.5/forecast?q='+app.paikkakunta+'&units=metric&appid=0be24cf7cc7a6b445eec1b2c59fc83cf')
        .then(function (response) {
          //käydään läpi silmukalla apin listaa ja poimitaan halutut tiedot
          for (i = 0; i < response.data.list.length; ++i) {
            //käytetään apu-muuttujia päivämäärän ja kellonajan pilkkomiseen yksinkertaisempaan muotoon
            // saatu ajankohta sisältää päivämäärän ja kellonajan, splitataan ensin välilyönnin kohdalta, ensimmäinen osa
            // on päivämäärä ja toinen osa kellonaika. Tämän jälkeen päivä splitataan väliviivasta, 
            // josta saadaan eroteltua päivä, kuukausi ja vuosi
            var paivamaara_apu = response.data.list[i].dt_txt.split(' ')[0]; 
            var vuosi = paivamaara_apu.split('-')[0];
            var kuukausi = paivamaara_apu.split('-')[1];
            var paiva = paivamaara_apu.split('-')[2];
            var paivamaara = paiva + '.'+ kuukausi + '.'+ vuosi;

            //kellonaika splitataan kaksoispisteestä, ja jätetään sekunnit pois näytettävästä osasta
            var kellonaika_apu = response.data.list[i].dt_txt.split(' ')[1];
            var tunnit = kellonaika_apu.split(':')[0];
            var minuutit = kellonaika_apu.split(':')[1];
            var kellonaika = tunnit + '.' + minuutit;

            // lisätään säätieto sekä muokattu päivämäärä ja kellonaika sää-listalle. Muokataan
            // samalla tuuli ja lämpötila numeroarvoiksi ja pyöristetään yhteen desimaaliin
            app.saa.push({
            paiva: paivamaara,
            kellonaika: 'klo ' + kellonaika,
            tuuli: {arvo:Number(response.data.list[i].wind.speed).toFixed(1), yksikko:'m/s'},
            lampotila: {arvo: Number(response.data.list[i].main.temp).toFixed(1), yksikko: ' °C'},
            kuvanosoite: "https://openweathermap.org/img/wn/"+response.data.list[i].weather[0].icon+"@2x.png",
            });
          }
        })
        .catch(function () {
          app.virheilmoitus = 'Paikkakuntaa ei löydy!' 
        })
    },

    haePaivamaarat: function(){
      // tyhjennetään ensin vanhat tiedot listoilta / muuttujista
        app.paivamaarat=[];
        app.saa = [];
        app.virheilmoitus = '';
        // haetaan tämä päivä ja viisi seuraavaa päivää
        for (i = 0; i < 6; ++i) { 
            var tanaan = new Date(); //haetaan tämä päivä
            tanaan.setDate(tanaan.getDate() + i); // lisätään tähän päivään kierrosluvun mukainen määrä päiviä
            var paiva = tanaan.getDate(); // irrotetaan saadusta päivämäärästä päivä
            var kk = tanaan.getMonth() + 1; // irrotetaan saadusta päivämäärästä kuukausi
            var vuosi = tanaan.getFullYear(); // irrotetaan saadusta päivämäärästä vuosi
            // muotoillaan päivämäärä uudestaan siten, että yksittäisten numeroiden eteen tulee nolla
            // eli lisätään päivän ja kuukauden numeron eteen nolla ja sen jälkeen valitaan kaksi viimeistä merkkiä
            paivamaara = (('0'+paiva).slice(-2) +'.'+ ('0'+kk).slice(-2) +'.'+ vuosi);
            // haetaan päivämäärää vastaava viikonpäivä
            var viikonpaivat = ['su','ma','ti','ke','to','pe','la'];
            var viikonpaiva  = viikonpaivat[tanaan.getDay()];
            //lisätään kierroksen päätteeksi päivämäärä+viikonpäivä listalle  
            //app.paivamaarat.push(DateString);            
            app.paivamaarat.push({paivamaara: paivamaara, viikonpaiva: viikonpaiva}); 
        }

        //tämä päivä on päivämäärälistan ensimmäisenä alkiona
        app.tamaPaiva = app.paivamaarat[0].paivamaara;

        // jos päivää ei ole vielä valittu/asetettu, laitetaan oletukseksi tämä päivä
        if(app.valittuPaiva==''){
          app.valittuPaiva=app.tamaPaiva;
        }

        // kutsutaan funktiota, joka hakee säätiedot
        this.getAnswer();
    },
    asetaPaiva: function(){
      app.valittuPaiva = event.target.id; //asetetaan valituksi päiväksi se päivä, mitä nappia painetaan
    },
    asetaPaikkakunta: function(kunta){//käytetään pikavalinnoissa paikkakunnan asettamiseen
      app.paikkakunta = kunta;
      this.haePaivamaarat();
    },  
  },
})