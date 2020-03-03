var app = new Vue({
    el: '#app',
    data: {
      paikkakunta:'',
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
    },
  
    methods: {
      getAnswer: function () {
        axios.get('http://api.openweathermap.org/data/2.5/forecast?q=ruovesi&appid=0be24cf7cc7a6b445eec1b2c59fc83cf')
          .then(function (response) {
            app.paikkakunta = response.data.city.name;
            let apu='';
            for (index = 0; index < response.data.list.length; ++index) {
              app.saa.push({
                paiva: response.data.list[index].dt_txt.split(' ')[0],
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
 
          app.today = new Date().toISOString().slice(0, 10)
          
      },
            
    },
  })