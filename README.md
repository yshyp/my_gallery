# My Gallery

A simple photo gallery application with an Express backend and a React frontend built with Vite.

## Features

- Upload images to the server
- View uploaded images in a masonry-style gallery
- Images are stored in the `uploads/` directory and served statically
- Contact page with placeholder details
- Animated transitions using Framer Motion
- Navigate between Home, Gallery, Upload and Contact pages using React Router

## Setup

1. Install dependencies for the backend:
   ```sh
   npm install
   ```
2. Install dependencies for the frontend:
   ```sh
   cd frontend
   npm install
   ```

## Running the App

1. Start the backend server from the project root:
   ```sh
   node server.js
   ```
   The server listens on port `5000` and stores uploads in the `uploads/` directory.

2. In a separate terminal, start the React development server inside `frontend/`:
   ```sh
   npm run dev
   ```
   This serves the frontend on `http://localhost:5173` by default.

## Building for Production

To create a production build of the frontend, run:
```sh
npm run build
```
The static files will be output to `frontend/dist/`.

## Environment Variables

No additional environment variables are required. The frontend expects the backend API at `http://localhost:5000` as configured in `App.jsx`.

