Vue.component('todo-item', {
    props: ['todo'],
    template: '#todo-item-template',//tehdään id, johon voi viitata scriptissä html-puolella
  });

var app = new Vue({
    el: '#app',
    data: {
      paikkakunta: 'london',
      saa:[{
        paiva:'',
        kellonaika:'',
        saa:'',
        tuuli:'',
        lampotila:'',
        ikoni:'',
        kuvanosoite:'',
      }],
      today:'',
      paivamaarat:[],
    },
  
    methods: {
      getAnswer: function () {
        axios.get('http://api.openweathermap.org/data/2.5/forecast?q='+this.paikkakunta+'&appid=0be24cf7cc7a6b445eec1b2c59fc83cf')
          .then(function (response) {
            app.paikkakunta = response.data.city.name;
            let apu='';
            for (index = 0; index < response.data.list.length; ++index) {
              paivamaara_apu = response.data.list[index].dt_txt.split(' ')[0];
              vuosi_apu = paivamaara_apu.split('-')[0];
              kuukausi_apu = paivamaara_apu.split('-')[1];
              paiva_apu = paivamaara_apu.split('-')[2];
              paivamaara = paiva_apu + '.'+ kuukausi_apu + '.'+ vuosi_apu;
                app.saa.push({
                //paiva: response.data.list[index].dt_txt.split(' ')[0],
                paiva: paivamaara,
                kellonaika: response.data.list[index].dt_txt.split(' ')[1],
                saa: response.data.list[index].weather[0].description,
                tuuli: response.data.list[index].wind.speed,
                lampotila: response.data.list[index].main.temp,
                ikoni: response.data.list[index].weather[0].icon,
                kuvanosoite: "http://openweathermap.org/img/wn/"+response.data.list[index].weather[0].icon+"@2x.png"
              });
            }
          })
          .catch(function (error) {
            app.title = 'Error! Could not reach the API. ' + error
          })
 
          //app.today = new Date().toISOString().slice(0, 10)

          /* for (index = 0; index < 6; ++index) {

              var someDate = new Date();
              var numberOfDaysToAdd = index;
              someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
              var dd = someDate.getDate();
              var mm = someDate.getMonth() + 1;
              var y = someDate.getFullYear();
              var someFormattedDate = dd + '.'+ mm + '.'+ y;
              app.paivamaarat.push(someFormattedDate);    
          }

          app.today = app.paivamaarat[0]; */
          
          

   
      },
      haePaivamaarat: function(){
          for (index = 0; index < 6; ++index) {

              var someDate = new Date();
              var numberOfDaysToAdd = index;
              someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
              var dd = someDate.getDate();
              var mm = someDate.getMonth() + 1;
              var y = someDate.getFullYear();
              DateString = (('0'+dd).slice(-2) +'.'+ ('0'+mm).slice(-2) +'.'+ y);
              //var someFormattedDate = dd + '.'+ mm + '.'+ y;
              var someFormattedDate = dd + '.'+ mm + '.'+ y;
              app.paivamaarat.push(DateString);    
          }

          app.today = app.paivamaarat[0]; 
      }, 
            
    },
  })