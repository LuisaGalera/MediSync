const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middlewares/auth.middleware');
const relatorioController = require('../controllers/relatorio.controller');

router.get('/mensal', autenticar, apenasAdmin, relatorioController.mensal);

module.exports = router;
