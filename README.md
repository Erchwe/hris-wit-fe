# HRMONIZE Frontend

Frontend web application for **HRMONIZE**, an internal Human Resource Information System (HRIS) used at **PT. WIT** — built using **React**, **Vite**, **Tailwind CSS**, and **Flowbite React**.

This repository covers features including:

- Remunerasi Karyawan
  - Gaji
  - Tunjangan
- Inventaris Barang
  - Daftar Barang
  - Daftar Peminjaman

---

## 🚀 Tech Stack

- ⚛️ React 19 (with Vite)
- 💨 Tailwind CSS 3
- 🎨 Flowbite + Flowbite React
- 🔃 React Router
- ✨ TypeScript
- 🌐 Go backend (CORS-enabled)

---

## 📦 Installation Guide

> Ensure Node.js (v18 or v20) and npm are installed.

### 🔧 For Windows users

1. Download and install Node.js from [nodejs.org](https://nodejs.org/).
2. Then follow the project steps below.

### 🍏 For macOS users (with Homebrew)

```bash
brew install node
brew install yarn
```

If you don’t have Homebrew yet:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then proceed with the steps below.

---

### 1. Clone the repository

```bash
git clone https://github.com/your-org/hrmonize-frontend.git
cd hrmonize-frontend
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Start the development server

```bash
npm run dev
```

Then open your browser and navigate to:

```
http://localhost:5173
```

---

## 🌐 Backend Integration

This frontend is configured to work with a backend built using Go.

### 🔐 CORS Requirement

Make sure your Go backend has CORS enabled to allow API calls from `http://localhost:5173`.

You can configure Axios base URL in a custom hook or service file like:

```ts
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});
```

---

## 📁 Project Structure

```
src/
├── assets/            # Static files (if needed)
├── components/        # Reusable components
├── layouts/           # Layout components like AppLayout
├── pages/             # Route pages grouped by feature
│   ├── remunerasi/
│   └── inventaris/
├── router/            # Routing configuration
├── App.tsx            # Main layout + router outlet
├── main.tsx           # Vite entry point
└── index.css          # Tailwind + global CSS
```

---

## 🙋 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

---

## 👨‍💻 Author

Made with ❤️ by **Intern Team IT Maranatha**  
Full Stack Developer Intern @ PT. WIT  
Magang MBKM - Universitas Kristen Maranatha  
> "Build what matters, ship with clarity."

---

## 📄 License

Licensed under the [MIT License](LICENSE).  
Feel free to fork, clone, and contribute.
