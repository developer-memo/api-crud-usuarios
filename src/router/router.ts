import { Router, Request, Response } from 'express';
import cron = require('node-cron');
import bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

import MySQL from '../mysql/mysql';
import RouterValida from './router.validators';
import JsonWebToken from '../helpers/jwt';
import MiddlewareJWT from '../middlewares/validar-jwt';

const routValida = new RouterValida();
const jwt = new JsonWebToken();
const middleware = new MiddlewareJWT();

const router = Router();

/*******************************************************************************************/
/*********** MÉTODOS POST ************/
/*******************************************************************************************/

/**
 * Método POST para insertar usuario nuevo
 */
router.post('/api/insertUsuario', async(req: Request, res: Response ) =>{
 
  routValida.validarUsuario(req.body.email, (err:any, data:any ) =>{
    if(data){
      return res.status(400).send({ 
        ok: false, 
        msg: 'El usuario con este correo electrónico ya está registrado'
      }); 
    }

    if ( err ) {
      if ( err == 'No hay registros.' ) {
        
        const query = `
        INSERT INTO usuarios 
        (nombre, email, telefono, direccion, genero, comentario, fecha_reg )
        VALUES ( '${req.body.nombre}', '${req.body.email}', ${req.body.telefono}, '${req.body.direccion}', '${req.body.genero}', '${req.body.comentario}', CURRENT_TIMESTAMP() )`;
        
        MySQL.ejecutarQuery( query, (err:any, result: Object[]) =>{
          if ( err ) {
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
          })

        });

      } else {
        return res.status(400).send({
          ok: false,
          msg: 'Problema al crear el usuario.',
          err
        })
      }
    }
  })

});





/*******************************************************************************************/
/*********** MÉTODOS GET ************/
/*******************************************************************************************/

/**
 * Método GET para validar en token de seguridad
 */
router.get('/api/loginrenew',  ( req: Request, res: Response  ) =>{

  const token = req.header( 'x-token' );

  const query = `
                SELECT * 
                FROM usuarios 
                WHERE id_us = ${middleware.user.id} AND email_us = '${middleware.user.email}'`;
  
  MySQL.ejecutarQuery( query, (err:any, usuario: Object[]) =>{
    if ( err ) {
      return res.status(400).send({
        ok: false,
        error: err
      });

    } else {
      return res.status(200).send({
        ok: true,
        msg: 'Usuario valido.',
        token,
        usuario
      })
    }
  })

});




/**
 *Método GET que obtiene todos los usuarios
 */
router.get('/api/usuarios',  ( req: Request, res: Response ) =>{

  //Usuarios.getAllClientes(req, res);
  try {
    const query = `SELECT * FROM usuarios `;

    MySQL.ejecutarQuery( query, (err:any, usuarios: Object[]) =>{
      if ( err ) {
        return res.status(400).send({
          ok: false,
          error: err
        });

      } else {
        return res.status(200).send({
          ok: true,
          usuarios
        })
      }
    })
  } catch (error) {
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
router.get('/api/usuarios/:idUser',  ( req: Request, res: Response ) =>{

  const escapeId = MySQL.instance.cnn.escape(req.params.idUser);

  const query = `SELECT * FROM usuarios WHERE id_us = ${escapeId} `;

  MySQL.ejecutarQuery( query, (err:any, usuario: Object[]) =>{
    if ( err ) {
      return res.status(400).send({
        ok: false,
        error: err
      });

    } else {
      return res.status(200).send({
        ok: true,
        usuario
      })
    }
  })

});





/*******************************************************************************************/
/*********** MÉTODOS PUT ************/
/*******************************************************************************************/

/**
 * Método PUT para actualizar usuario por id
 */
router.put('/api/updateUsuario',  (req: Request, res: Response ) =>{
  
  try {
    const query = `
                UPDATE usuarios
                SET nombre = '${req.body.nombre}', email = '${req.body.email}', telefono = '${req.body.telefono}', direccion = '${req.body.direccion}', genero = '${req.body.genero}', comentario = '${req.body.comentario}'
                WHERE id = ${req.body.id} `;

    MySQL.ejecutarQuery( query, (err:any, result:any) =>{
      
      if ( err ) {
        return res.status(400).send({
          ok: false,
          error: err
        });

      } 

      if ( result.affectedRows == 0 ) {

        return res.status(400).send({
          ok: false,
          msg: 'No es posible actualizar el usuario. Verifica los datos.',
          error: err
        });
        
      } else {
        return res.status(200).send({
          ok: true,
          msg: 'Usuario actualizado con éxito.',
          result
        });
      }
    });
  } catch (error) {
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
router.delete('/api/deleteUser/:id',  (req: Request, res: Response ) =>{
  try {
    const escapeId = MySQL.instance.cnn.escape(req.params.id);
    const query = `DELETE FROM usuarios WHERE id = ${escapeId}`;

    MySQL.ejecutarQuery( query, (err:any, result: Object[]) =>{
      if ( err ) {
        return res.status(400).send({
          ok: false,
          msg: `No es posible eliminar el usuario. Inténtelo más tarde.`,
          error: err
        });

      } else {
        return res.status(200).send({
          ok: true,
          msg: `El usuario fue eliminado con éxito.`,
          result
        })
      }
    })
  } catch (error) {
    return res.status(500).send({
      ok: false,
      msg: 'Error inesperado en eliminación... Revisar logs',
      error
    }); 
  }
})



//================================================================
//================================================================
/**
 * Método que mantiene la conexión de MySQL
 */
cron.schedule('*/3 * * * *', () =>{
  const hora = new Date().getTime();
  MySQL.ejecutarQuery('SELECT 1', (err:any, result:any) =>{
    if ( err ) {
      throw new Error("Error conexión");
    } else {
      console.log(`Conexión constante!! ${result} - ${hora}`);
    }
  });
});



export default router;