const DEBUG = false;
const enableFeature = true;
const absoluteRemove = false;
let currentfontSize = 16;

let currentTasks = [];
let activeElement;
const taskList = document.querySelector(".task_list");


//----------ДЛЯ РАБОТЫ С ФАЙЛАМИ----------//
const FILE_WITH_OLD_TASKS = "/sdcard/old_tasks.txt";
const FILE_WITH_OLD_TASKS_STATUSES = "/sdcard/old_tasks_statuses.txt";
let storage;
if(!DEBUG){
	storage = navigator.getDeviceStorage("sdcard");
}


const createFile = (file_name, text) => {
	var file = new Blob([text], {type: "text/plain"});
	var request = storage.addNamed(file, file_name);
	request.onsuccess = function () {
	  var name = this.result;
	  console.log('File "' + name + '" successfully wrote on the sdcard storage area');
	}
	request.onerror = function () {
	  alert('Unable to write the file: ' + this.error);
	}
}

const rewriteFile = (file_name, text) => {
	let request = storage.delete(file_name);

	request.onsuccess = function () {
	  console.log("File deleted");
	  createFile(file_name, text);
	}

	request.onerror = function () {
	  alert("Unable to delete the file: " + this.error);
	}
}

//----------ДЛЯ ПРЕОБРАЗОВАНИЯ ДАТЫ----------//
const formatData = d =>{
  return String(d.getDate()).padStart(2,'0') + "." + 
    String(d.getMonth()+1).padStart(2,'0') + "." + 
    String(d.getFullYear()) + " " + 
    String(d.getHours()).padStart(2,'0') + ":" +
    String(d.getMinutes()).padStart(2,'0') + ":" +
    String(d.getSeconds()).padStart(2,'0')
}

//----------ЛОГИКА----------//
//фича -- изменение размера шрифта
const fontSize = (scale) =>{
	if(enableFeature){
		currentfontSize = currentfontSize+scale;
		document.querySelector(".frame").style.fontSize = currentfontSize;
		document.getElementById(currentTasks[activeElement]).scrollIntoView();
	}
}


//добавление заявок в файл со всеми полученными заявками
const addNewTasksToFile = (newTasks) => {
	//читаем файл
	let request = storage.get(FILE_WITH_OLD_TASKS);
	let file;
	request.onsuccess = function () {
	  file = this.result;

	  let r = new FileReader();
	  r.readAsText(file);
	  r.onload = function() {
	    let tasksFromFile = r.result;
	    let oldTasks = JSON.parse(tasksFromFile);
	    //склеиваем новые задания со старыми
	    let allTasks = oldTasks.concat(newTasks);
	    let text = JSON.stringify(allTasks);
	    //перезаписываем файл
	    rewriteFile(FILE_WITH_OLD_TASKS, text);
	  };
	  r.onerror = () => alert("Ошибка при чтении заданий из файла (aNTTF): " + r.error);
	};

	request.onerror = () => alert("Ошибка при получении файла с заданиями (aNTTF): " + request.error);
}

//добавление заявок в интерфейс из файла со всеми полученными заявками
const addTasksFromFile = () => {
	let request = storage.get(FILE_WITH_OLD_TASKS);
	let file;
	request.onsuccess = function () {
	  file = this.result;

	  let r = new FileReader();
	  r.readAsText(file);
	  r.onload = function() {
	    let tasksFromFile = r.result;
	    addTasks(JSON.parse(tasksFromFile), false);
	  };
	  r.onerror = () => alert("Ошибка при чтении заданий из файла (aTFF): " + r.error);
	};

	request.onerror = () => alert("Ошибка при получении файла с заданиями (aTFF): " + request.error);
}


const addTask = (id, text, deliveryupdate = true) => {
	//добавление в интерфейс
	const item = document.createElement("li");
	item.innerHTML = text;
	item.setAttribute("id", id);
	taskList.appendChild(item);
	currentTasks.push(id);
	//подсветить первый элемент при добавлении на пустой лист
	if (currentTasks.length-1 == 0){
		activeElement = 0;
		item.classList.add("active");
	}

	//подтвердить получение
	if(deliveryupdate){
		data = [{
	    "id_message": id,
	    "delivered": "true",
	    "delivery_error": ""
		}];
		fetch("http://176.117.140.244:5000/1s_api?method=/praktika_lift/hs/MessengerHTTP/v1/deliveryupdate", {
	    method: 'POST',
	    body: JSON.stringify(data),
	    headers: {'Content-Type': 'application/json'}
	  })
		  .then(response => 
		  	response.text().then(d => console.log(d))
		  )
		  .catch(error => alert("Подтверждение получения не отправлено на сервер: " + error));
	}
}


const addTasks = (arrayOfTasks, addToFile = true) => {
	//добавить сообщения в файл
	if(addToFile && !DEBUG){
		addNewTasksToFile(arrayOfTasks);
	}
	//добавить сообщение в интерфейс
	arrayOfTasks.forEach(element => {
		deliveryupdate = addToFile; //подтверждение получения нужно только если есть добавление в файл
		addTask(element["id_message"], element["message_text"].replace(/\n/g,'<br>'), deliveryupdate);
	})
}

const acceptTask = () => {
	let id = currentTasks[activeElement];
	//отправляем сообщение о приёме заявки на сервер
	let date = new Date();
	let data = [{
		"id_message":id,
		"date_of_acquaintance":formatData(date)
	}];
	console.log(JSON.stringify(data));
	fetch("http://176.117.140.244:5000/1s_api?method=/praktika_lift/hs/MessengerHTTP/v1/responseupdate", {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'application/json'}
  })
  	.then(response => 
	  	response.text().then(d => {
	  		if(d=="ОК"){
	  			if(!DEBUG){
	  				//добавляем в файл со статусами старых заявок, что заявка принята
	  				let request = storage.get(FILE_WITH_OLD_TASKS_STATUSES);
	  				let file;
	  				request.onsuccess = function () {
	  				  file = this.result;

	  				  let r = new FileReader();
	  				  r.readAsText(file);
	  				  r.onload = function() {
	  				    let oldTasksStatuses = r.result;
	  				    oldTasksStatuses = oldTasksStatuses+","+id;
	  				    //перезаписываем файл
	  				    rewriteFile(FILE_WITH_OLD_TASKS_STATUSES, oldTasksStatuses)

	  				  };
	  				  r.onerror = function() {
	  				    console.log(r.error);
	  				  };
	  				}

	  			}
	  			//отмечаем, что ознакомились
	  			document.getElementById(id).classList.add("accepted");
	  			//для того чтобы стереть заявку из интерфейса. При перезапусе приложения появится снова
	  			if(absoluteRemove){
	  				currentTasks.splice(activeElement, 1);
	  				if (currentTasks.length > 0){
	  					activeElement = activeElement == 0 ? 0 : activeElement - 1;
	  					document.getElementById(currentTasks[activeElement]).classList.add("active");
	  				}
	  			}
	  		} else {
	  			alert("Подтверждение ознакомления не отправлено на сервер: " + d);
	  			console.log(d);
	  		}
	  	})
	  )
	  .catch(error => alert("Подтверждение ознакомления не отправлено на сервер: " + error));
}



//----------НАВИГАЦИЯ----------//
//проверка видимости элемента
const notVisible = (target) => {
  // Все позиции элемента
  let targetPosition = {
      top: window.pageYOffset + target.getBoundingClientRect().top,
      bottom: window.pageYOffset + target.getBoundingClientRect().bottom
    };
    // Получаем позиции окна
    const frame = document.querySelector(".frame");
  let windowPosition = {
      top: window.pageYOffset + frame.getBoundingClientRect().top,
      bottom: window.pageYOffset + frame.getBoundingClientRect().bottom
    };
  if (targetPosition.bottom <= windowPosition.bottom && 
    targetPosition.top >= windowPosition.top) {
    // Если элемент полностью видно, то запускаем следующий код
    return false;
  } else {
    return true;
  };
};


const edgeNotVisible = (target, dir) => {
	//dir = -1 -- верхняя грань
	//dir = 1 -- нижняя грань
  // Все позиции элемента
  let targetPosition = {
      top: window.pageYOffset + target.getBoundingClientRect().top,
      bottom: window.pageYOffset + target.getBoundingClientRect().bottom
    };
    // Получаем позиции окна
    const frame = document.querySelector(".frame");
  let windowPosition = {
      top: window.pageYOffset + frame.getBoundingClientRect().top,
      bottom: window.pageYOffset + frame.getBoundingClientRect().bottom
    };
  console.log(targetPosition);
  console.log(windowPosition);
  if(dir>0){
  	if(targetPosition.bottom <= windowPosition.bottom){
  		return false
  	} else {
  		return true
  	}
  } else 
  if(dir<0){
  	if(targetPosition.top >= windowPosition.top){
  		return false
  	} else {
  		return true
  	}
  }
};


//навигация по сообщениям
const navigation = (dir) =>{
	let previousActiveElement = document.getElementById(currentTasks[activeElement]);
	if(edgeNotVisible(previousActiveElement, dir)){
		document.querySelector(".frame").scrollBy(0, 30*dir);
	} else {
	if (activeElement > -1 && currentTasks.length > 0){
		previousActiveElement.classList.remove("active");
		activeElement = (activeElement + dir) % currentTasks.length;
		if(activeElement<0){
			activeElement = activeElement + currentTasks.length;
		}
		const newActiveElement = document.getElementById(currentTasks[activeElement]);
		newActiveElement.classList.add("active");
		if(notVisible(newActiveElement)){
			let focus = dir<0;
			if(edgeNotVisible(previousActiveElement, (-1)*dir)){
				focus = !focus
			}
			newActiveElement.scrollIntoView(focus);
		}
	}} 
}


document.addEventListener("keydown", (e)=>{
	switch (e.key){
		case "ArrowUp":
			navigation(-1);
		break;

		case "ArrowDown":
			navigation(1);
		break;

		case "Enter":
			if (currentTasks.length > 0 && !document.getElementById(currentTasks[activeElement]).classList.contains("accepted")){
				acceptTask();
			}
		break;

		case "1":
			fontSize(-5);
		break;
		case "3":
			fontSize(5);
		break;
	}
})









//----------ПРИ ЗАПУСКЕ ПРИЛОЖЕНИЯ----------//
//добавляем старые заявки из файла
if(!DEBUG){
	addTasksFromFile();

	//устанавливаем старым принятым заявкам класс accepted
	let request = storage.get(FILE_WITH_OLD_TASKS_STATUSES);
	let file;
	request.onsuccess = function () {
	  file = this.result;

	  let r = new FileReader();
	  r.readAsText(file);
	  r.onload = function() {
	    let oldTasksStatuses = r.result.slice(1);
	    arrOfAcceptedTasksId = oldTasksStatuses.split(",");
	    arrOfAcceptedTasksId.forEach(id =>{
	    	document.getElementById(id).classList.add("accepted");
	    })
	  }
	}
	var dialPromise = navigator.mozMobileConnections[0].getDeviceIdentities();
	dialPromise.then(function(deviceInfo) {
		 console.log(deviceInfo);
        if (deviceInfo.imei) {
          console.log(deviceInfo.imei);
        } else {
          var errorMsg = 'Could not retrieve the IMEI code for SIM ' +
            simSlotIndex;
          console.log(errorMsg);
          return Promise.reject(
            new Error(errorMsg)
          );
        }
      });
} else {
	for(let j = 0; j<10; j++){
		addTask(j, ("Заявка "+j+"<br>").repeat(5), false);
	}
}