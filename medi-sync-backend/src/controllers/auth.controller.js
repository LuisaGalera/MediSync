const authService = require('../services/auth.service');

async function registrar(req, res, next) {
  try {
    const usuario = await authService.registrar(req.body);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', usuario });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const resultado = await authService.login(email, senha);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login };
