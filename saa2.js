Vue.component('saa-item', {
  props: ['saa'],
  template: `<div>
                <p> {{ saa.kellonaika }} </p>
                <p> {{ saa.lampotila }} </p>
                <p> {{ saa.tuuli }} </p>
                <img :src="saa.kuvanosoite"></img> 
        </div>`,
})


Vue.component('saaennuste', {
  template: `<h1>Sääennuste</h1>`
})

var app = new Vue({
  el: '#app',
  data: {
      title:'',
      paikkakunta: '',
      saa:[{
          paiva:'',
          viikonpaiva: '',
          kellonaika:'',
          saakuvaus:'',
          tuuli:'',
          lampotila:'',
          ikoni:'',
          kuvanosoite:'',
          id: '',
      }],
      today:'',
      paivamaarat:[],
      valittuPaiva:'',
  },

  methods: {
    getAnswer: function () {
      axios.get('http://api.openweathermap.org/data/2.5/forecast?q='+this.paikkakunta+'&units=metric&appid=0be24cf7cc7a6b445eec1b2c59fc83cf')
        .then(function (response) {
          //app.paikkakunta = response.data.city.name;
          
          for (index = 0; index < response.data.list.length; ++index) {
              //käytetään apu-muuttujia päivämäärän ja kellonajan pilkkomiseen yksinkertaisempaan muotoon
              // saatu ajankohta sisältää päivämäärän ja kellonajan, splitataan ensin välilyönnin kohdalta, ensimmäinen osa
              // on päivämäärä ja toinen osa kellonaika. Tämän jälkeen päivä splitataan väliviivasta, 
              // josta saadaan eroteltua päivä, kuukausi ja vuosi
              paivamaara_apu = response.data.list[index].dt_txt.split(' ')[0]; 
              vuosi_apu = paivamaara_apu.split('-')[0];
              kuukausi_apu = paivamaara_apu.split('-')[1];
              paiva_apu = paivamaara_apu.split('-')[2];
              paivamaara = paiva_apu + '.'+ kuukausi_apu + '.'+ vuosi_apu;

              //kellonaika splitataan kaksoispisteestä, ja jätetään sekunnit pois näytettävästä osasta
              kellonaika_apu = response.data.list[index].dt_txt.split(' ')[1];
              tunnit = kellonaika_apu.split(':')[0];
              minuutit = kellonaika_apu.split(':')[1];
              kellonaika = tunnit + '.' + minuutit;

              // lisätään säätieto muokatun päivämäärän ja kellonajan kanssa sää-listalle
              
              app.saa.push({
              paiva: paivamaara,
              kellonaika: 'klo ' + kellonaika,
              saakuvaus: response.data.list[index].weather[0].description,
              tuuli: response.data.list[index].wind.speed + ' m/s',
              lampotila: response.data.list[index].main.temp + ' °C',
              kuvanosoite: "http://openweathermap.org/img/wn/"+response.data.list[index].weather[0].icon+"@2x.png",
            });
          }
        })
        .catch(function () {
          app.title = 'Paikkakuntaa ei löydy!' 
        })

    },
    haePaivamaarat: function(){
      // tyhjennetään ensin vanhat tiedot listoilta
        app.paivamaarat=[];
        app.saa = [];
        app.title = '';
        // haetaan tämä päivä ja viisi seuraavaa päivää
        for (index = 0; index < 6; ++index) { 
            var someDate = new Date(); //haetaan tämä päivä
            someDate.setDate(someDate.getDate() + index); // lisätään tähän päivään kierrosluvun mukainen määrä päiviä
            var paiva = someDate.getDate(); // irrotetaan saadusta päivämäärästä päivä
            var kk = someDate.getMonth() + 1; // irrotetaan saadusta päivämäärästä kuukausi
            var vuosi = someDate.getFullYear(); // irrotetaan saadusta päivämäärästä vuosi
            // muotoillaan päivämäärä uudestaan siten, että yksittäisten numeroiden eteen tulee nolla
            // eli lisätään päivän ja kuukauden numeron eteen nolla ja sen jälkeen valitaan kaksi viimeistä merkkiä
            DateString = (('0'+paiva).slice(-2) +'.'+ ('0'+kk).slice(-2) +'.'+ vuosi); 
            //var viikonpaivat = ['sunnuntai','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
            //var viikonpaiva  = viikonpaivat[someDate.getDay()];
            //lisätään kierroksen päätteeksi päivämäärä listalle  
            app.paivamaarat.push(DateString);            
            //app.paivamaarat.push({paivamaara: DateString, viikonpaiva: viikonpaiva}); 
        }

        //tämä päivä on päivämäärälistan ensimmäisenä alkiona
        app.today = app.paivamaarat[0].paivamaara; 

        // kutsutaan funktiota, joka hakee säätiedot
        this.getAnswer();
    },
    asetaPaiva: function(){
        app.valittuPaiva = event.target.id;
      },
      asetaPaikkakunta: function(kunta){
          app.paikkakunta = kunta;
          this.haePaivamaarat();
        },  
  },
})