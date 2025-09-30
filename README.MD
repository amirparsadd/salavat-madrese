# Salavat Madreseh - Clicker App

A fun web project that lets users "pray" for schools to be canceled! This project uses Vue 3, Vite, and TailwindCSS for the frontend and a simple Hono API to manage the counters.

---

## Features

* Global and daily counters for prayers (salavats)
* Large circular button to send a salavat
* Optimistic updates on click with periodic server sync
* UI in Persian
* Responsive and mobile-friendly

---

## Requirements

* Node.js 18+
* npm
* Running Hono API backend

---

## Installation and Running
These steps may vary depending component of the app.

### 1. Clone the repository

```bash
git clone https://github.com/amirparsadd/salavat-madrese
cd salavat-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run dev
```

The app will run at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

### 5. Backend Requirements

The app expects a Hono API running at `http://localhost:3000` with the following endpoints:

* `GET /` : fetch current counter data
* `POST /click` : increment the counter

---

## Project Structure

```
src/
 ├─ App.vue        # Main UI component
 ├─ main.ts        # Entry point
 └─ index.css      # TailwindCSS styles
```

---

## Usage

1. Open the website
2. See the total and daily prayer counts
3. Click the 🙏 button to send a salavat
4. Counters update instantly locally and sync with the server periodically

---

## Customization

* Button style can be customized using TailwindCSS
* Sync interval can be adjusted in `App.vue` (default 5 seconds)
* UI text and language can be modified as needed

---

## License

MIT License
