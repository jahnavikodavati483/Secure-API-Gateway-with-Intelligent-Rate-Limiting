# 🔐 Secure Cloud File Storage & Vault

A full-stack application for securely storing files using **client-side AES-256 + RSA-2048 encryption**.  
Files are encrypted in the browser — the server never sees raw data (**zero-knowledge architecture**).

---

## 🚀 Live Demo  
https://secure-api-gateway-with-intelligent.vercel.app/dashboard  

---

## 📸 Preview  
![Dashboard](sandbox:/mnt/data/Screenshot%202026-03-19%20084338.png)

---

## ✨ Key Features  

- 🔒 Client-side encryption (Zero-Knowledge)  
- 🗝️ AES-256 (file encryption) + RSA-2048 (key encryption)  
- ☁️ Cloud storage using Cloudinary  
- 🛡️ JWT authentication with Spring Security  
- 📂 Secure upload, download, and deletion  

---

## 🏗️ Architecture  

1. File encrypted using AES-256 (client-side)  
2. AES key encrypted using RSA public key  
3. Encrypted file → Cloudinary  
4. Metadata + encrypted key → MongoDB  
5. Decryption using user's private key  

---

## 🛠️ Tech Stack  

- Frontend: React (Vite)  
- Backend: Spring Boot, Java 17  
- Database: MongoDB Atlas  
- Storage: Cloudinary  
- Security: AES + RSA, JWT  
- Deployment: Vercel + Render  

---

## 📚 What I have learned 

- Hybrid encryption (AES + RSA)  
- Zero-knowledge system design  
- Secure key management  
- Full-stack deployment  

---

## ⚠️ Note  

Private key is generated in-browser and not stored on server.  
Losing it means losing access to files.
