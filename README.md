# Encrypted PDF Viewer

A Vue.js application that demonstrates secure PDF viewing with client-side decryption. The PDF is encrypted on the server and decrypted in the browser using Web Crypto API.

## Features

- 🔐 Server-side PDF encryption using AES-256-CBC
- 🔓 Client-side decryption using Web Crypto API
- 📄 PDF viewing with watermark support
- 🎨 Modern Vue 3 + Vite setup
- 🚀 Separate Express.js backend server

## Architecture

1. **Backend Server**: Express.js server (separate project) that fetches PDF from external source, encrypts it using AES-256-CBC, and serves encrypted data
2. **Frontend Client**: Vue.js application that fetches encrypted PDF, decrypts it using Web Crypto API, and displays it in a PDF viewer
3. **Security**: Encryption key is served separately from encrypted data for demonstration purposes

## Project Setup

### Install Dependencies

```sh
npm install
```

### Development Mode

Start the Vue development server:

```sh
npm run dev
```

The frontend will be available at `http://localhost:5173` and will connect to the backend server running on `http://localhost:3000`.

### Production Mode

Build the Vue application:

```sh
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## API Endpoints

- `GET /api/encrypted-pdf` - Returns encrypted PDF data
- `GET /api/decrypt-key` - Returns decryption key (for demo purposes)
- `GET /` - Serves the main application

## Security Notes

⚠️ **Important**: This is a demonstration project. In a production environment:

- Never expose decryption keys to clients
- Use proper authentication and authorization
- Implement secure key management
- Consider using more sophisticated encryption schemes
- Add proper error handling and logging

## Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).
