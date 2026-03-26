# Tic Tac Toe

Welcome to the Tic Tac Toe project! This document contains everything you need to set up, test, and deploy the game.

⚠️ It has been noticed during testing that some network providers with slower speeds are causing disturbance during matchmaking.

---

## 🛠️ Setup Guide

Here is a simple, step-by-step guide explaining how to set up the project on your local machine and prepare it for the live server. 

### 💻 Step 1: Local Development

Steps to run the code on your own laptop for development:

1. **Clone:** Download the code from GitHub using `git clone https://github.com/iarghadip/tictactoe.git`.
2. **Environment:** Copy the example environment variables file using `cp server/.env.example server/.env`.
3. **Backend:** Open a terminal, go to the server folder, and start the Nakama server using `cd server` then `nakama --config nakama-config.yml`. (Make sure your local CockroachDB is already running).
4. **Frontend:** Open a new terminal tab, go to the client folder, install packages, and start the frontend using `cd client`, `npm install`, and finally `npm run dev`.

### 🐳 Step 2: Build & Testing

How to test the build locally using Docker before taking anything live:

1. **Keys:** Generate and export a secure Nakama key using `export VITE_NAKAMA_KEY=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")`.
2. **Host:** Set your local test host by running `export VITE_NAKAMA_HOST=0.0.0.0.nip.io`.
3. **Email:** Set the email for the SSL certificate using `export CERTBOT_EMAIL=hello@email.com`.
4. **Docker:** Build and start the containers to make sure nothing breaks using `docker-compose up --build`.

### 🌐 Step 3: Server Configuration Details

The one-time server setup needed for GitHub Actions to do its magic automatically:

1. **Server:** Create a new Linux VM on Google Cloud (GCP) and install the required tools using `sudo apt-get install docker.io docker-compose nodejs -y`.
2. **Firewall:** Go to your GCP network settings and allow HTTP (Port `80`) and HTTPS (Port `443`) traffic so people can actually open the game.
3. **Access:** Generate an SSH key (`ssh-keygen`), paste the public key into the `authorized_keys` file, and secure it using `chmod 600 authorized_keys`.
4. **Secrets:** Go to your GitHub repository settings and add these secrets so GitHub can log in: `DOMAIN`, `EMAIL`, `SERVER_IP`, `SSH_PASSPHRASE`, `SSH_PRIVATE_KEY`, and `SSH_USERNAME`.
5. **Auto-Deploy:** Since `.github/deploy.yml` is already configured, pushing code to the deployment branch will automatically trigger the build and deploy everything to GCP.

---

## 🎮 Multiplayer Testing Guide

Here is a simple guide to testing if two players can successfully connect and play against each other.

### 🔗 Where to Test (Server Links)
Choose the link based on where you are currently testing the game:
* **Development Server (Local):** `http://localhost:3000`
* **Live Server (Production):** `https://136.116.202.164.nip.io`

### 🕹️ Step-by-Step Testing

The steps to test the matchmaking remain the exact same for both local and live servers:

1. **Open the Game:** Open the server link from two different devices (like your laptop and your phone) or use two completely different web browsers.
2. **Choose Game Mode:** Select either a **Timed Match** or a **Classic Match** on both screens. If the app asks for a username, go ahead and type one in.
3. **Matchmaking:** Wait a moment for the server to find a match. Once matchmaking is completed, both players will automatically be connected into a single game of Tic-Tac-Toe!

---

## 🚀 Deployment Process

Here is a simple, step-by-step guide explaining how our code goes from a developer's laptop to the live server. 

### 🛠️ Tech Stack
* **Frontend & Backend:** React, Nakama
* **Database:** CockroachDB
* **Code Management:** Git, GitHub
* **Automation:** GitHub Actions
* **Server & Traffic:** GCP Compute, Docker, Nginx

### 💻 Step 1: Development Cycle

Strict step-by-step testing process before anything goes live:

1. **Feature Branch:** Every new feature is written in its own separate branch.
2. **Basic Testing:** Run basic unit tests and when the code passes merge it into the `development` branch.
3. **Test:** Before a new release, the whole `development` branch is tested very carefully.
4. **Build:** Build the project locally using Docker to make sure nothing breaks during the build process.
5. **Deploy:** Merge the `development` branch into the `production` branch. This action automatically starts the final deployment job.

### 🌐 Step 2: Deployment Cycle

Once the code reaches the `production` branch, GitHub Actions takes over and does all the heavy lifting automatically:

1. **Login:** GitHub Actions securely logs into our Google Cloud server (GCP VM) using SSH.
2. **Fetch:** It pulls the latest, fully-tested code from the `production` branch.
3. **Build:** Docker starts building the application and opens the `80` and `443` ports so the app can communicate.
4. **Secure:** Certbot fetches a fresh SSL certificate to make sure the connection is secure.
5. **Traffic:** Nginx is set up as a reverse proxy and makes it accessible to the world.

---

## 🚀 Architecture & Design

<p align="center">
  <img src="architecture-diagram.png" alt="Architecture Diagram" width="600" />
</p>

The project is built using a **Containerized Three-Tier, Client-Server, Server-Authoritative, Component-Based Architecture**. This means the backend server makes the final decisions for the game state, which keeps things secure and prevents cheating.

Here is a simple breakdown of how the system is designed to run efficiently:

### 📦 Containerized Three-Tier Architecture
We chose this deployment model because the project is currently lean enough to run perfectly on a single Virtual Machine (VM). By using Docker, we carefully separate the system into three distinct containers:
1. **Presentation Tier:** The React Frontend.
2. **Application Tier:** The Nakama Backend.
3. **Data Tier:** The CockroachDB Database.

This containerized approach guarantees smooth and consistent operation, whether you are testing it locally on your laptop or running it live in production.

### 🔄 Agile Methodology
The project is built with an Agile mindset. The codebase and deployment pipeline are structured so that new features, tweaks, or bug fixes can be shipped quickly and continuously without breaking the live game.

### 🧩 Frontend (Client-Side)
* **React:** The user interface is built using a strict **Component-Based Architecture**. This makes the UI modular, highly reusable, and easy to maintain as the project grows.

### ⚙️ Backend (Server-Side)
* **Nakama:** The entire backend is fully powered by the Nakama game server executable. It handles the heavy lifting for real-time multiplayer connections, matchmaking, and user authentication.

### 🗄️ Database
* **CockroachDB:** We use Nakama’s highly reliable default database, CockroachDB. It works seamlessly within our Docker environment to safely store all player data and game records.