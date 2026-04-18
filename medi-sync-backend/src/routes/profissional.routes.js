const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const profissionalController = require('../controllers/profissional.controller');

router.use(autenticar);

router.get('/', profissionalController.listar);
router.get('/:id', profissionalController.buscarPorId);

module.exports = router;
