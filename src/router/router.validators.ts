import MySQL from '../mysql/mysql';

export default class RouterValida {

  //Atributos
  public dataUser:any[] = [];


  //Método para validar usuario
  public validarUsuario = async(email:string, callback:Function) =>{

    const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
    
    MySQL.ejecutarQuery( query, (err:any, result: Object[]) =>{

      this.dataUser = result;

      if ( err ) {
        callback(err, null);
  
      } else {
        callback(null, result);
      }
    })

  }



}