let ukup = "http://176.117.140.244:5000/1s_api?method=praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598";
//let ukup = "http://kaios_test:4is8Pl@217.172.30.250/praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598";
let promise = new Promise(function(resolve, reject) {

  let timerId = setTimeout(function tick() {
    console.log("tick");
    
    fetch(ukup).then(
      response => {
        if (response.status !== 200) {  
          console.log('Не удалсоь получить новые задания. Ошибка сети: ' + response.status);  
          return;
        }

        response.json().then(data => {  
          if(data.length>0){
            var notification = new Notification('Назначена новая заявка!');
            addTasks(data);
            console.log(data);
          }
        });
      }
    );

    timerId = setTimeout(tick, 10000);
  }, 10000);

});


promise.then(
  result => alert("Синхронизация с сервером прервана"),
  error => alert("Синхронизация с сервером прервана")
);