const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const consultaController = require('../controllers/consulta.controller');

router.use(autenticar);

router.post('/', consultaController.agendar);
router.get('/historico/:paciente_id', consultaController.historico);
router.patch('/:id/cancelar', consultaController.cancelar);
router.patch('/:id/reagendar', consultaController.reagendar);

module.exports = router;
