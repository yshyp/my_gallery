# Photo Gallery Frontend

A modern, interactive photo gallery built with React and Vite.

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your backend API URL:
   ```
   VITE_API_URL=http://localhost:5000
   ```

   **Note:** 
   - For local development, use `http://localhost:5000`
   - For production, use your actual backend URL
   - If accessing from a different device, use your computer's IP address instead of localhost

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Interactive photo gallery with masonry layout
- Image upload functionality
- PWA support with offline capabilities
- Modern, responsive design
- Image optimization and lazy loading

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
