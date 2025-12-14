# MERN Application Deployment with Docker and Ansible

This repository contains a web application based on the **MERN architecture (MongoDB, Express, React, and Node.js)**, deployed on an **IaaS infrastructure** using Docker containers and automation tools.

The main goal of this project is to compare different deployment approaches for a multi-tier application, ranging from a simple single-server setup to a distributed and fully automated deployment.

---

## Application Architecture

The application is composed of three main services:

- **Front-End**: A React application built with Vite and served via Nginx.
- **Back-End**: A REST API developed with Node.js and Express.
- **Database**: MongoDB used for persistent storage.

Each component runs in its own independent container.

---

## Technologies Used

- Docker  
- Docker Compose  
- Ansible  
- Node.js  
- Express  
- React (Vite)  
- MongoDB  
- Nginx  

---

## Repository Structure

```text
.
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf.template
│   └── ...
├── docker-compose.yml
├── ansible/
│   ├── ansible.cfg
│   ├── inventory/
│   │   ├── .env
│   │   ├── inventory.ini
│   │   └── ...
│   ├── playbooks/
│   │   └── app_deploy.yml
│   └── swarm/
│       └── stack.yml
└── README.md