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

Deploy
- Domain and SSL: Purchase domain, use [Let's Encrypt](https://letsencrypt.org/) for free SSL certificate to enable HTTPS.
- Frontend : Host static HTML/JS/CSS on Vercel or AWS S3 for global access.
- Signaling Server: Implement WebSocket based signaling (e.g., Node.js + Socket.io) for automated SDP/ICE exchange, deploy to Render, or AWS EC2.
- STUN/TURN Configuration: Use public STUN servers; add TURN (e.g., coturn) for NAT traversal, deploy on VPS like DigitalOcean.
- Security: Enforce HTTPS, add authentication for signaling rooms, validate inputs.
- Testing: Test connectivity across networks, handle firewalls.
