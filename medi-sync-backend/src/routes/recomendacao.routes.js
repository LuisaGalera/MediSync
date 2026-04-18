const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const recomendacaoController = require('../controllers/recomendacao.controller');

router.get('/:paciente_id', autenticar, recomendacaoController.obter);

module.exports = router;
