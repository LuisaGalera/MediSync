const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
}

function apenasAdmin(req, res, next) {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
}

function apenasProfissional(req, res, next) {
  if (!['profissional', 'admin'].includes(req.usuario.perfil)) {
    return res.status(403).json({ erro: 'Acesso restrito a profissionais de saúde' });
  }
  next();
}

module.exports = { autenticar, apenasAdmin, apenasProfissional };
