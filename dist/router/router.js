"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cron = require("node-cron");
const { v4: uuidv4 } = require('uuid');
const mysql_1 = __importDefault(require("../mysql/mysql"));
const router_validators_1 = __importDefault(require("./router.validators"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const routValida = new router_validators_1.default();
const jwt = new jwt_1.default();
const middleware = new validar_jwt_1.default();
const router = (0, express_1.Router)();
/*******************************************************************************************/
/*********** MÉTODOS POST ************/
/*******************************************************************************************/
/**
 * Método POST para insertar usuario nuevo
 */
router.post('/api/insertUsuario', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    routValida.validarUsuario(req.body.email, (err, data) => {
        if (data) {
            return res.status(400).send({
                ok: false,
                msg: 'El usuario con este correo electrónico ya está registrado'
            });
        }
        if (err) {
            if (err == 'No hay registros.') {
                const query = `
        INSERT INTO usuarios 
        (nombre, email, telefono, direccion, genero, comentario, fecha_reg )
        VALUES ( '${req.body.nombre}', '${req.body.email}', ${req.body.telefono}, '${req.body.direccion}', '${req.body.genero}', '${req.body.comentario}', CURRENT_TIMESTAMP() )`;
                mysql_1.default.ejecutarQuery(query, (err, result) => {
                    if (err) {
                        return res.status(400).send({
                            ok: false,
                            error: err,
                            query
                        });
                    }
                    res.status(200).send({
                        ok: true,
                        msg: 'Usuario registrado con éxito.',
                        result
                    });
                });
            }
            else {
                return res.status(400).send({
                    ok: false,
                    msg: 'Problema al crear el usuario.',
                    err
                });
            }
        }
    });
}));
/*******************************************************************************************/
/*********** MÉTODOS GET ************/
/*******************************************************************************************/
/**
 * Método GET para validar en token de seguridad
 */
router.get('/api/loginrenew', (req, res) => {
    const token = req.header('x-token');
    const query = `
                SELECT * 
                FROM usuarios 
                WHERE id_us = ${middleware.user.id} AND email_us = '${middleware.user.email}'`;
    mysql_1.default.ejecutarQuery(query, (err, usuario) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                error: err
            });
        }
        else {
            return res.status(200).send({
                ok: true,
                msg: 'Usuario valido.',
                token,
                usuario
            });
        }
    });
});
/**
 *Método GET que obtiene todos los usuarios
 */
router.get('/api/usuarios', (req, res) => {
    //Usuarios.getAllClientes(req, res);
    try {
        const query = `SELECT * FROM usuarios `;
        mysql_1.default.ejecutarQuery(query, (err, usuarios) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    error: err
                });
            }
            else {
                return res.status(200).send({
                    ok: true,
                    usuarios
                });
            }
        });
    }
    catch (error) {
        return res.status(500).send({
            ok: false,
            msg: 'Error inesperado en inserción... Revisar logs',
            error
        });
    }
});
/**
 *Método GET que obtiene el usuario por id
 */
router.get('/api/usuarios/:idUser', (req, res) => {
    const escapeId = mysql_1.default.instance.cnn.escape(req.params.idUser);
    const query = `SELECT * FROM usuarios WHERE id_us = ${escapeId} `;
    mysql_1.default.ejecutarQuery(query, (err, usuario) => {
        if (err) {
            return res.status(400).send({
                ok: false,
                error: err
            });
        }
        else {
            return res.status(200).send({
                ok: true,
                usuario
            });
        }
    });
});
/*******************************************************************************************/
/*********** MÉTODOS PUT ************/
/*******************************************************************************************/
/**
 * Método PUT para actualizar usuario por id
 */
router.put('/api/updateUsuario', (req, res) => {
    try {
        const query = `
                UPDATE usuarios
                SET nombre = '${req.body.nombre}', email = '${req.body.email}', telefono = '${req.body.telefono}', direccion = '${req.body.direccion}', genero = '${req.body.genero}', comentario = '${req.body.comentario}'
                WHERE id = ${req.body.id} `;
        mysql_1.default.ejecutarQuery(query, (err, result) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    error: err
                });
            }
            if (result.affectedRows == 0) {
                return res.status(400).send({
                    ok: false,
                    msg: 'No es posible actualizar el usuario. Verifica los datos.',
                    error: err
                });
            }
            else {
                return res.status(200).send({
                    ok: true,
                    msg: 'Usuario actualizado con éxito.',
                    result
                });
            }
        });
    }
    catch (error) {
        return res.status(500).send({
            ok: false,
            msg: 'Error inesperado en actualizar... Revisar logs',
            error
        });
    }
});
/*******************************************************************************************/
/*********** MÉTODOS DELETE ************/
/*******************************************************************************************/
/**
 * Método para eliminar usuario por id
 */
router.delete('/api/deleteUser/:id', (req, res) => {
    try {
        const escapeId = mysql_1.default.instance.cnn.escape(req.params.id);
        const query = `DELETE FROM usuarios WHERE id = ${escapeId}`;
        mysql_1.default.ejecutarQuery(query, (err, result) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    msg: `No es posible eliminar el usuario. Inténtelo más tarde.`,
                    error: err
                });
            }
            else {
                return res.status(200).send({
                    ok: true,
                    msg: `El usuario fue eliminado con éxito.`,
                    result
                });
            }
        });
    }
    catch (error) {
        return res.status(500).send({
            ok: false,
            msg: 'Error inesperado en eliminación... Revisar logs',
            error
        });
    }
});
//================================================================
//================================================================
/**
 * Método que mantiene la conexión de MySQL
 */
cron.schedule('*/3 * * * *', () => {
    const hora = new Date().getTime();
    mysql_1.default.ejecutarQuery('SELECT 1', (err, result) => {
        if (err) {
            throw new Error("Error conexión");
        }
        else {
            console.log(`Conexión constante!! ${result} - ${hora}`);
        }
    });
});
exports.default = router;
