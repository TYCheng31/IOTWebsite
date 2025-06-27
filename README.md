# 機房環境監測  
*架構圖  
<img src="https://github.com/user-attachments/assets/b8a715f4-b348-474c-ba56-2861e4532652" alt="image" width="800" />  
## app.js
後端程式碼
## arduino.c
Node-32S程式碼
* 蒐集感測器數據 (溫溼度、機房機櫃開關狀態)
* 傳資料到資料庫 (MongoDB)

## index.html / script.js
前端程式碼  
*介面放上辦公室中及時查看機房狀態  
<img src="https://github.com/user-attachments/assets/6b6e2419-90fe-4357-a989-669c944923aa" alt="819C85DF-3BF4-458F-A659-C0FDFBC275AB" width="400"/>  

### 前端功能
* 溫溼度
* 機櫃開啟狀態
* 歷史警告
* 警報設定 (溫溼度警告閾值設定、警告開關)

## smoketest.ino
蒸煙警報器  
*裝置放置於機櫃頂端  
<img src="https://github.com/user-attachments/assets/9e5f3d84-88c7-4588-9e99-1cb7cda6cc91" alt="31A74EF3-B3E6-48E8-B919-71AFC265D660" width="400"/>  
使用twsms服務綁定手機簡訊  
發生火警或是有異常煙霧會及時通知   





