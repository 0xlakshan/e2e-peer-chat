This program ensures your conversations are private, accessible only to you and your contact. No server stores your messages, protecting you from mass surveillance

```
peer A           STUN server           peer B
  |                    |                    |
  |----create conn---->|                    |  
  |<---ice candidates--|                    |
  |                    |                    |
  |----create offer--->|                    |  
  |                    |                    |
  |--------------send offer---------------> |
  |                    |                    |
  |                    |<---receive offer---|  
  |                    |                    |
  |                    |-- create answer -->|  
  |                    |                    |
  |<------------ send answer ---------------|  
  |                    |                    |
  |---set remote desc--|                    |  
  |                    |---set remote desc--|  
  |                    |                    |
  |----exchange ice candidates------------->| 
  |<---exchange ice candidates--------------| 
  |                    |                    |
  |----data channel established-------------|
```
