#include <HTTPClient.h>
#include <WiFi.h>

const int sensorPin = 32;  // 改用支持ADC的引腳，如32或33
const int redPin = 23;     // RGB燈紅色引腳
const int switchPin = 33;
const char *ssid = "TP-Link_A298";
const char *password = "46336019";

// Line Notify設定
const char *lineToken = "lQH4uePpXErUla1mxcNo64OrzW0BWHzaCJjnhr7IlkP";  // 把這裡換成你自己的Token
bool lock = false;

void setup() {
  Serial.begin(115200);
  Serial.println("Starting up...");

  // 初始化WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi!");

  // 延遲以確保WiFi連接完成並且系統穩定
  delay(2000);

  // 設定RGB燈引腳為輸出
  pinMode(redPin, OUTPUT);
  pinMode(switchPin, INPUT_PULLUP);
}

void setColor(int red) {
  analogWrite(redPin, red);
}

void sendLineNotify(String message) { 
  HTTPClient http;
  http.begin("https://notify-api.line.me/api/notify");
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  http.addHeader("Authorization", "Bearer " + String(lineToken));
  
  String payload = "message=" + message;
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void loop() {
  // 讀取類比值
  int smokeValue = analogRead(sensorPin);
  int switchState = digitalRead(switchPin);
  Serial.print("Analog Read Value: ");
  Serial.println(smokeValue);
  Serial.print("Switch State: ");
  Serial.println(switchState);

  if(switchState == LOW){
    smokeValue = 4000;
  }

  // 判斷類比值是否超過1900，超過則發送Line Notify通知並改變RGB燈顏色
  if (smokeValue > 1100 && !lock) {
    sendLineNotify("偵測到煙霧 " + String(smokeValue));
    setColor(255);
    lock = true;
    delay(5000);
  } else if (smokeValue <= 1100 && lock) {
    setColor(0);
    lock = false;
  } 

  delay(1000);
}
