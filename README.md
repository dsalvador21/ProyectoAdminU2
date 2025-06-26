# Proyecto Unidad 2 – Construcción y Orquestación de Microservicios

## Descripción General

Este proyecto consiste en desarrollar una aplicación de gestión de tareas colaborativas basada en arquitectura de microservicios. Para esta unidad se trabajó en la contenerización con Docker y la orquestación de los servicios utilizando Docker Compose.

### Microservicios incluidos:

- `user-service`: Gestión de usuarios.
- `task-service`: Gestión de tareas.
- `nginx-proxy-manager`: Punto de entrada central (API Gateway con interfaz gráfica para configuración de rutas y certificados).

---

## Estructura de Microservicios

### 1. user-service

- Lenguaje: **Express.js**
- Base de datos: **PostgreSQL**
- Endpoints:
  - `POST /users` – Registrar usuario
  - `GET /users` – Listar todos los usuarios
  - `GET /users/{id}` – Obtener usuario específico
  - `GET /users/health` – Verificar estado
- Validaciones: Email único, campos obligatorios

### 2. task-service

- Lenguaje: **Express.js**
- Base de datos: **PostgreSQL**
- Comunicación interna con `user-service` para validar usuarios
- Endpoints:
  - `POST /tasks` – Crear tarea
  - `GET /tasks` – Listar tareas
  - `GET /tasks/{id}` – Obtener tarea
  - `PUT /tasks/{id}` – Actualizar estado
  - `GET /tasks?user_id=X` – Filtrar por usuario
  - `GET /tasks/health` – Verificar estado
- Estados de tareas: `pendiente`, `en progreso`, `completada`

---

## Orquestación con Docker Compose

Se utilizó un archivo `docker-compose.yml` para:

- Definir ambos servicios y sus bases de datos PostgreSQL
- Crear una red interna (`app-network`) para comunicación segura
- Configurar `nginx-proxy-manager` como API Gateway
- Añadir **healthchecks**, volúmenes y variables de entorno

### Enrutamientos configurados (vía NPM):

- `/api/users/*` → `user-service`
- `/api/tasks/*` → `task-service`
- `/admin` → interfaz del proxy inverso

---

## Instrucciones de Despliegue

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/dsalvador21/ProyectoAdminU2
   cd ProyectoAdminU2
   ```

2. Levantar el entorno:
   ```bash
   docker-compose up --build -d
   ```

3. Acceder a la interfaz Nginx Proxy Manager en el navegador:
   ```
   http://localhost:81
   ```

---

## Mantenimiento y Reseteo

### Restablecer configuración de NPM:

```bash
rm -rf data/letsencrypt/*
rm -rf data/npm/*
docker-compose down
docker-compose up --build -d
```

### Borrar volúmenes de las bases de datos:

```bash
docker-compose down -v
```

---

## Configuración de NPM (Nginx Proxy Manager)

### Primer acceso (credenciales por defecto):

- Usuario: `admin@example.com`  
- Contraseña: `changeme`

### Credenciales personalizadas para este proyecto:

- Usuario: `admin@admin.com`  
- Contraseña: `12345678`

### Proxy Host 1 – Redirección general (login NPM por defecto):

- **Domain name**: `localhost`
- **Forward hostname/IP**: `localhost`
- **Forward port**: `81`

#### Rutas avanzadas personalizadas:

```nginx
location /api/users/ {
  proxy_pass http://user-service:3000/users/;
}

location /api/tasks/ {
  proxy_pass http://task-service:3000/tasks/;
}
```

### Proxy Host 2 – Acceso explícito a la interfaz admin:

- **Domain name**: `admin.localhost`
- **Forward hostname/IP**: `localhost`
- **Forward port**: `81`

#### Custom location:
- **Location**: `/admin`
- **Forward hostname/IP**: `localhost`
- **Forward port**: `81`

---

## APIs disponibles

### Ruta base:
```
http://localhost
```

### user-service:

- `GET /api/users/` → Listar todos los usuarios
- `GET /api/users/{id}` → Buscar usuario por ID
- `POST /api/users/` → Registrar nuevo usuario
- `GET /api/users/health` → Estado del servicio

### task-service:

- `GET /api/tasks/` → Listar todas las tareas
- `GET /api/tasks/{id}` → Buscar tarea por ID
- `POST /api/tasks/` → Crear nueva tarea
- `PUT /api/tasks/{id}` → Actualizar estado de tarea
- `GET /api/tasks?user_id=X` → Tareas de un usuario
- `GET /api/tasks/health` → Estado del servicio

---

## Healthchecks activos

Todos los servicios en `docker-compose.yml` tienen healthchecks configurados para validar su estado de forma automática y reiniciarse si es necesario.

---

# Comandos Útiles

---

## Comandos Básicos de Docker Compose

```bash
docker-compose up --build -d
```
Construye y levanta todos los servicios en segundo plano.

```bash
docker-compose down
```
Detiene y elimina los contenedores.

```bash
docker-compose down -v
```
Detiene y elimina los contenedores **y** los volúmenes asociados (útil para resetear bases de datos).

```bash
docker-compose ps
```
Muestra el estado de todos los servicios.

```bash
docker-compose logs -f
```
Ver los logs en tiempo real de todos los servicios.

```bash
docker-compose logs -f user-service
```
Ver logs específicos del servicio `user-service`.

---

## Comandos para Inspección y Debug

```bash
docker ps
```
Lista todos los contenedores activos.

```bash
docker inspect <container_id_or_name>
```
Muestra detalles completos de un contenedor (estado, IP, puertos, etc).

```bash
docker exec -it user-service bash
```
Abre una terminal interactiva dentro del contenedor `user-service`.

```bash
docker exec -it db-users psql -U user -d usersdb
```
Conecta directamente al PostgreSQL del user-service.

```bash
docker stats
```
Muestra el uso de CPU, RAM y red por contenedor (monitor tipo `htop`).

---

## Healthchecks y APIs

```bash
curl http://localhost/api/users/health
```
Verifica el estado del servicio de usuarios.

```bash
curl http://localhost/api/tasks/health
```
Verifica el estado del servicio de tareas.

---

## Imágenes y Volúmenes

```bash
docker images
```
Lista todas las imágenes locales.

```bash
docker volume ls
```
Lista todos los volúmenes.

```bash
docker volume rm <volume_name>
```
Elimina un volumen específico.

---

## Comandos de Redes Docker

```bash
docker network ls
```
Lista todas las redes Docker.

```bash
docker network inspect app-network
```
Muestra información detallada de la red `app-network`.

```bash
docker network connect app-network <container_id>
```
Conecta un contenedor a la red `app-network`.

```bash
docker network disconnect app-network <container_id>
```
Desconecta un contenedor de la red.

```bash
docker exec -it task-service ping user-service
```
Verifica conectividad de red entre microservicios.

```bash
docker exec -it user-service curl http://task-service:3000/tasks/health
```
Prueba HTTP entre servicios internamente en Docker.

```bash
docker network create app-network
```
Crea una red bridge personalizada manualmente.

```bash
docker run -dit --name test-container --network app-network alpine
```
Contenedor de prueba conectado a la red `app-network`.

```bash
docker network rm app-network
```
Elimina la red (solo si no hay contenedores conectados).

---

## Autor

**Diego Salvador**  
Estudiante de Ingeniería Civil en Computación 
Universidad de Talca – 2025

---