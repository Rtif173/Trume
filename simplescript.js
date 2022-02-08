console.log("симпл");
// let u = "http://217.172.30.250/praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598";

// let xhr = new XMLHttpRequest();
// xhr.open(
// 	"GET", 
// 	"http://217.172.30.250/praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598", 
// 	false, 
// 	"kaios_test", "4is8Pl"
// );
// // xhr.withCredentials = true;
// //xhr.setRequestHeader("Authorization", "Basic " + btoa("kaios_test:4is8Pl"));
// xhr.send(null);
// //xhr.send(null);
// console.log(xhr.responseText);
let u = "http://127.0.0.1:5000/1s_api?method=praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598";
var xhr = new XMLHttpRequest();
xhr.open("GET", u, false);
xhr.send();
console.log(xhr.responseText);

// var xhr = new XMLHttpRequest();
// xhr.open("GET", "http://217.172.30.250/praktika_lift/hs/MessengerHTTP/v1/msgupdate?imei1=356943110183598", false, "kaios_test", "4is8Pl");
// xhr.withCredentials = true;
// xhr.setRequestHeader("Authorization", 'Basic ' + btoa("kaios_test:4is8Pl"));
// xhr.send();
// console.log(xhr.responseText);

// $.ajax({
//     xhrFields: {
//         withCredentials: true
//     },
//     headers: {
//         'Authorization': 'Basic ' + btoa('kaios_test:4is8Pl'),
//         'Referrer-Policy': 'origin-when-cross-origin'
//     },
//     url: u
// });