# Maasin HealthLine authentication setup

This update adds JWT authentication and admin authorization to the backend and the Admin dashboard.

## 1. Configure the backend environment

In the `server` directory, copy `.env.example` to `.env` and fill in:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: a long, random secret (at least 32 characters)
- `ADMIN_USERNAME`: the email for your initial administrator
- `ADMIN_PASSWORD`: a strong, unique password for your initial administrator
- `PORT`: optional; defaults to `5000`

Do not commit `.env` to GitHub or share it publicly. The example file is safe to commit because it contains placeholders only.

## 2. Install and start the backend

From PowerShell in `server`:

```powershell
npm.cmd install
npm.cmd run dev
```

When MongoDB connects, the server creates the initial admin account from `ADMIN_USERNAME` and `ADMIN_PASSWORD` if that email is not already registered. If you change the env password after that account has already been created, changing the env value will not update the existing account's password.

## 3. Start the frontend

Open another PowerShell terminal:

```powershell
cd ..\Frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, then choose **Admin** and sign in with the configured administrator credentials.

## Permissions

- Public visitors can view service and health-information listings and submit appointment requests.
- Only a logged-in administrator can list/manage appointments, create/update/delete services, and create/update/delete health-information articles.
- Login tokens expire after 8 hours.

## Security notes

- Use HTTPS when deployed.
- Keep `.env` private and use a unique password.
- For a production system containing real patient information, review logging, rate limiting, CORS origins, password-reset policy, and privacy requirements before deployment.
