export default class Enviroments {

  //Método con objeto para conexión a BD MYSQL
  public static datosConexion = () =>{
    const dataConnect:any = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'prueba_tuatara'
    };

    return dataConnect;
    
  }
  
}
