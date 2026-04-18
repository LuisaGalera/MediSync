const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepo = require('../repositories/usuario.repository');
const pacienteRepo = require('../repositories/paciente.repository');

// RN-001: CPF único, senha nunca armazenada em texto claro
async function registrar(dados) {
  const { cpf, nome, email, senha, telefone, perfil, data_nascimento, convenio } = dados;

  if (!cpf || !nome || !email || !senha) {
    throw { status: 400, message: 'CPF, nome, e-mail e senha são obrigatórios' };
  }

  const cpfExistente = await usuarioRepo.buscarPorCpf(cpf);
  if (cpfExistente) {
    throw { status: 409, message: 'CPF já cadastrado no sistema' };
  }

  const emailExistente = await usuarioRepo.buscarPorEmail(email);
  if (emailExistente) {
    throw { status: 409, message: 'E-mail já cadastrado no sistema' };
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  const novoUsuario = await usuarioRepo.criar({ cpf, nome, email, senha_hash, telefone, perfil });

  if (!perfil || perfil === 'paciente') {
    await pacienteRepo.criar({ usuario_id: novoUsuario.id, data_nascimento, convenio });
  }

  return novoUsuario;
}

async function login(email, senha) {
  const usuario = await usuarioRepo.buscarPorEmail(email);

  if (!usuario) {
    throw { status: 401, message: 'Credenciais inválidas' };
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaCorreta) {
    throw { status: 401, message: 'Credenciais inválidas' };
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return { token, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } };
}

module.exports = { registrar, login };
