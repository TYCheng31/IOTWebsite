#include <WiFi.h>
#include <ESPAsyncWebSrv.h>
#include <DHTesp.h>
#include <HTTPClient.h>

const byte hallPin = 13;//霍爾感應的pin角
const byte dhtPin = 14;//溫溼度的pin角
const byte dhtPin2 = 15;//溫溼度的pin角
const byte dhtPin3 = 27;//溫溼度的pin角
const char *ssid = "TP-Link_A298";//Wifi名稱
const char *password = "46336019";//Wifi密碼
const char *serverUrl = "http://192.168.0.105:3000/data/doordata"; //ipconfig ipv4
const char *THUrls[] = {"http://192.168.0.105:3000/data/thdata1", 
                        "http://192.168.0.105:3000/data/thdata2",
                        "http://192.168.0.105:3000/data/thdata3"};//三個溫溼度的資料庫資料夾
bool lock = false;

DHTesp dht, dht2, dht3;

AsyncWebServer server(80);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");

    pinMode(hallPin, INPUT);
    dht.setup(dhtPin, DHTesp::DHT22);
    dht2.setup(dhtPin2, DHTesp::DHT22);
    dht3.setup(dhtPin3, DHTesp::DHT22);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(200, "text/plain", "This is the Arduino server");
    });
}

//傳送溫溼度數據到資料庫的function
void sendData(const char* url, DHTesp& dhtSensor) {
    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    String postData = "temperature=" + String(dhtSensor.getTempAndHumidity().temperature) + "&humidity=" + String(dhtSensor.getTempAndHumidity().humidity);
    int httpResponseCode = http.POST(postData);
    if (httpResponseCode > 0) {
        Serial.println("Data sent to server successfully");
    } else {
        Serial.println("Error sending data to server");
    }
    http.end();
}

//重複讀取霍爾感應與蒐集溫溼度
void loop() {
    int hallValue = digitalRead(hallPin);

    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String postData = "doornumber=" + String(1) + "&doorstate=" + String(hallValue);

    if (hallValue == 1 && !lock) {
        int httpResponseCode = http.POST(postData);
        if (httpResponseCode > 0) {
            Serial.println("DooropenData sent to Node.js server successfully");
            lock = true;
        } else {
            Serial.println("Error sending Dooropendata to Node.js server");
        }
    } else if (hallValue == 0 && lock) {
        int httpResponseCode = http.POST(postData);
        if (httpResponseCode > 0) {
            Serial.println("DoorcloseData sent to Node.js server successfully");
            lock = false;
        } else {
            Serial.println("Error sending Doorclosedata to Node.js server");
        }
    }
    http.end();

    //傳送溫溼度數據到資料庫
    static unsigned long lastUpdateTime = 0;
    if (millis() - lastUpdateTime >= 15000) { // Update every 15 seconds
        for (int i = 0; i < 3; i++) {
            sendData(THUrls[i], i == 0 ? dht : (i == 1 ? dht2 : dht3));
        }
        lastUpdateTime = millis();
    }
}
