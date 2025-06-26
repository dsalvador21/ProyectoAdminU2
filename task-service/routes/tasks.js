const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const axios = require('axios');
require('dotenv').config();

// Verifica si el usuario existe consultando el microservicio de usuarios
const userExists = async (userId) => {
  try {
    const res = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}`);
    return res.status === 200;
  } catch {
    return false;
  }
};

// Health
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Obtener tareas (todas o por usuario)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.user_id;
    const where = userId ? { userId } : undefined;
    const tasks = await Task.findAll({ where });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Obtener tarea por ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Crear tarea
router.post('/', async (req, res, next) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: "Título y userId son obligatorios" });
    }

    const exists = await userExists(userId);
    if (!exists) return res.status(404).json({ error: "Usuario no existe" });

    const task = await Task.create({ title, description, userId });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// Actualizar tarea
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['pendiente', 'en progreso', 'completada'].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
