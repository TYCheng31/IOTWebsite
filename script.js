var savedmessages = [];//存傳送過的警告
var savedtimes = [];//存傳送過警告的時間
var linelock = 1;
//時間
function updateDateTime() {
  var currentDateTime = new Date();
  var currentTimeElement = document.getElementById('CurrentTime');
  var currentDateElement = document.getElementById('Updatetime');
  var formattedTime = padNumber(currentDateTime.getHours()) + ':' + padNumber(currentDateTime.getMinutes()) + ':' + padNumber(currentDateTime.getSeconds());
  var formattedDate = currentDateTime.getFullYear() + '/' + (currentDateTime.getMonth() + 1) + '/' + currentDateTime.getDate();
  
  currentTimeElement.textContent = '日期:' + formattedDate +'時間:' + formattedTime;
}

//時間去0
function padNumber(number) {
  return (number < 10) ? '0' + number : number;
}     

//門位 改門位圖示顏色
var doorlock = 1;
function fetchDoorData() {
  var xhttp = new XMLHttpRequest();
  var doormessage;
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(this.responseText);
          var latestData = data[data.length - 1] || {};
          var timestampString = new Date(latestData.timestamp);
          var gmtPlus8Time = timestampString.getFullYear() + '/' + (timestampString.getMonth() + 1) + '/' + timestampString.getDate() + ' ' + padNumber(timestampString.getHours()) + ':' + padNumber(timestampString.getMinutes()) + ':' + padNumber(timestampString.getSeconds());
          var indicatornumber = latestData.doornumber;
          var statusIndicator = document.getElementById('indicator' + indicatornumber);
          var doorlocate;

          //門位訊息的狀態
          (indicatornumber <= 6) ?  doorlocate = '_前門' : doorlocate = '_後門';
          if(indicatornumber > 6){
            indicatornumber = indicatornumber / 2;
          }
          doormessage ='機櫃' + indicatornumber + doorlocate + '已開啟';

          //找最新一筆門位資料選擇傳送LineNotify
          if(latestData.doorstate == 1 && doorlock == 0){
            sendLineNotify(gmtPlus8Time , doormessage);
            doorlock = 1;
          }
          else if(latestData.doorstate == 0){
            doorlock = 0;
          }

          //document.getElementById('Updatetime').innerHTML = '上次異動時間: ' + gmtPlus8Time ;
          
          //門位被開啟顯示紅色
          if (latestData.doorstate === 1) {
            statusIndicator.style.backgroundColor = 'red';
          } else {
            statusIndicator.style.backgroundColor = 'rgb(9, 252, 9)';
          }
      }
  };
  xhttp.open('GET', '/data/doordata', true);
  xhttp.send();
}

//溫溼度
var temperaturelock = [1,1,1,1];//三個溫濕度警告的鎖
var limit_temperature = [100,100,100,100];//初始限制溫度
function fetchTH1Data() {
  var TemLocation = ["機櫃後溫度: ","冷氣出風口溫度: ","室內溫度: "];
  var HumLocation = ["機櫃後濕度: ","冷氣出風口濕度: ","室內溼度: "];

  //總共有三個溫溼度感測器
  for(let i=1;i<4;i++){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var latestData = data[data.length - 1] || {};
            var timestampString = new Date(latestData.timestamp);
            var gmtPlus8Time = timestampString.getFullYear() + '/' + (timestampString.getMonth() + 1) + '/' + timestampString.getDate() + ' ' + padNumber(timestampString.getHours()) + ':' + padNumber(timestampString.getMinutes()) + ':' + padNumber(timestampString.getSeconds());
            document.getElementById('temperature' + i).innerHTML = TemLocation[i - 1] + latestData.temperature + 'C';
            document.getElementById('humidity' + i).innerHTML = HumLocation[i - 1] + latestData.humidity + '%';
            
            //溫度過高就傳送LineNotify
            if(latestData.temperature > limit_temperature[i] && temperaturelock[i] == 0){
              (i == 1)?temperaturemessage = '機櫃後溫度過高':(i == 2)? temperaturemessage = '冷氣出風口溫度過高':temperaturemessage = '室內溫度過高';
              sendLineNotify(gmtPlus8Time, temperaturemessage);
              temperaturelock[i] = 1;
            }
            else if(latestData.temperature < limit_temperature[i]){
              temperaturelock[i] = 0;
            }
            //console.log(latestData.temperature, limit_temperature[i], temperaturelock[i]);
        }
    };
    xhttp.open('GET', '/data/thdata' + i, true);
    xhttp.send();
  }
}

//警告
function fetchHISData() {
  var today = new Date();
  var todayStr = today.getFullYear() + '/' + ('0' + (today.getMonth() + 1)).slice(-1) + '/' + ('0' + today.getDate()).slice(-2);
  for(var i = 1; i < 11; i++){
    //console.log(savedtimes);//第一項是第十筆最後一項才是最新一筆資料
    if(savedtimes[savedtimes.length-i] != null){
      document.getElementById('warning' + i).innerHTML = savedtimes[savedtimes.length-i] + '     ' + savedmessages[savedmessages.length-i];
      if(savedtimes[savedtimes.length-i].split(' ')[0] == todayStr){
        document.getElementById('todaywarning' + i).innerHTML = savedtimes[savedtimes.length-i] + '     ' + savedmessages[savedmessages.length-i];
      }
    }
    //console.log(savedtimes[savedtimes.length-i].split(' ')[0],todayStr);
  }
}

//LineNotify
//0503只要有傳送訊息就會把警告訊息存進sendmessages，讓溫溼度警告跟門位警告資料合在一起
//時間也是傳送訊息時會存起來至savedtimes
function sendLineNotify(times, sendmessage) {
  var message = sendmessage;
  var url = "/send-line-notify";
  
  savedmessages.push(message);
  if(savedmessages.length > 10){
    savedmessages.shift();
  }
  savedtimes.push(times);
  if(savedtimes.length > 10){
    savedtimes.shift();
  }
  console.log(savedmessages,savedtimes );
  if(linelock == 1){
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('發送訊息時發生錯誤');
        }
        console.log("訊息已成功發送至 Line Notify！");
        return response.text();
    })
    .then(data => {
        console.log(data);
        document.getElementById("response").innerText = data;
    })
    .catch(error => console.error(error));
  }
}

//設定按鈕
document.addEventListener('DOMContentLoaded', function () {

  //設定按鈕
  menutoggle.addEventListener('click', function () {
    temmenu.classList.remove('active');
    menu.classList.toggle('active');
  });

  //溫度設定按鈕
  tembutton.addEventListener('click', function () {
    menu.classList.remove('active');
    temmenu.classList.toggle('active');
  });

  //溫度確認按鈕
  submitbutton.addEventListener('click', function(){
    limit_temperature = [100,100,100,100];

    if(limittemperature1.value != ''){
      limit_temperature[1] = limittemperature1.value;
    }
    if(limittemperature2.value != ''){
      limit_temperature[2] = limittemperature2.value;
    }
    if(limittemperature3.value != ''){
      limit_temperature[3] = limittemperature3.value;
    }
    temperaturelock = [0,0,0,0];
    temmenu.classList.remove('active');

    //設定完成提示
    var alertBox = document.createElement('div');
    alertBox.textContent = '溫度設定已完成！';
    alertBox.classList.add('alert-box');
    document.body.appendChild(alertBox);
    setTimeout(function(){
        alertBox.remove();
    }, 2000); 
  }); 

  //Line通知開啟關閉按鈕
  linebutton.addEventListener('click', function () {
    linelock = !linelock;
    if(linelock == true){
      document.getElementById('linebutton').innerHTML='開啟通知'
      var linealertBox = document.createElement('div');
      linealertBox.textContent = 'Line通知已開啟！';
      linealertBox.classList.add('alert-box');
      document.body.appendChild(linealertBox);
      setTimeout(function(){
        linealertBox.remove();
      }, 2000);
    }
    else if(linelock == false){
      document.getElementById('linebutton').innerHTML='關閉通知';
      var linealertBox = document.createElement('div');
      linealertBox.textContent = 'Line通知已關閉！';
      linealertBox.classList.add('alert-box');
      document.body.appendChild(linealertBox);
      setTimeout(function(){
        linealertBox.remove();
      }, 2000);
    }
    //console.log(linelock);
  });

  //關閉溫度設定頁面按鈕
  DDMTCbutton.addEventListener('click', function () {
    temmenu.classList.remove('active');
  });

  //關閉通知設定按鈕
  DDMLCbutton.addEventListener('click', function () {
    doormenu.classList.remove('active');
  });

  //關閉設定按鈕
  DDMCbutton.addEventListener('click', function () {
    menu.classList.remove('active');
  });

  //門位設定按鈕
  doorbutton.addEventListener('click', function () {
    menu.classList.remove('active');
    doormenu.classList.toggle('active');
  });
  
});

//網頁刷新資料頻率
setInterval(updateDateTime, 100); 
setInterval(fetchTH1Data, 100);
setInterval(fetchDoorData, 100);
setInterval(fetchHISData, 100);
