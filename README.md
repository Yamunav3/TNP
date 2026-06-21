# TNP Portal

Production-ready training and placement portal split into:

- `client/` for the React + Vite frontend
- `server/` for the Node.js + Express backend

## Structure

```bash
project-root/
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── eslint.config.js
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── README.md
└── .gitignore
```

## Local Development

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Backend

```bash
cd server
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:5173
```

## Deployment

### Vercel frontend

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Set:

```env
VITE_API_URL=https://your-backend.onrender.com
```

### Render backend

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Set:

```env
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

## Notes

- CORS allows `http://localhost:5173` and the deployed frontend URL.
- Uploaded resumes are served from the backend `uploads/` directory.
- The frontend reads the API base from `VITE_API_URL`.
