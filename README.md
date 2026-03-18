# 🔐 Secure Cloud File Storage & Vault

A production-grade, full-stack application for securely storing files in the cloud using **client-side AES-256 + RSA-2048 encryption**. Files are encrypted on the user's device before being uploaded — the server never sees raw file contents or decryption keys.

## 🚀 Live Demo

**[link)](https://secure-api-gateway-with-intelligent.vercel.app/login)**

> **Security Note**: Your RSA private key is generated locally in your browser during registration and is **never saved to the server**. Download it immediately after registration, as it is the only way to recover your files.

---

## ✨ Features

- 🔒 **True Zero-Knowledge** : Encryption happens entirely in the browser; the server only stores encrypted blobs.
- 🗝️ **Asymmetric Cryptography** : AES keys are wrapped in RSA-2048, ensuring only the key holder can decrypt.
- ☁️ **Cloud Storage Integration** : Securely integrated with Cloudinary for handling large file uploads.
- 🗄️ **Persistent Metadata** : File details and user records managed with MongoDB Atlas.
- 🛡️ **Enterprise Security** : Backend protected by Spring Security 6 and JWT authentication.
- 📂 **Dashboard** : Instant upload, real-time decryption (download), and secure deletion.
- 📱 **Premium UI** : Responsive, Neobanking-inspired aesthetic built with React and Lucide.

---

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons |
| **Backend** | **Java 17, Spring Boot 3, Spring Security 6** |
| **Database** | MongoDB Atlas (Spring Data) |
| **Cloud Storage** | Cloudinary SDK |
| **Security** | `node-forge` (RSA-2048), `crypto-js` (AES-256) |
| **Auth** | JWT (JSON Web Tokens) with Custom Filter Chain |
| **Deployment** | Vercel (Frontend) + Render (Dockerized Java) |

---
