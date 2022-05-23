"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Enviroments {
    constructor() {
        this.JWT_SECRET = 'Pr32T4m02Yum3%E#$QWRER2o2o@M3m0sddf&gjkt567567@89345dflkjty';
    }
}
exports.default = Enviroments;
//Método con objeto para conexión a BD MYSQL
Enviroments.datosConexion = () => {
    const dataConnect = {
        host: '149.56.93.240',
        user: 'gtsoftweb_us_prueba_tuatara',
        password: 'm4V)OvGEX7w?',
        database: 'gtsoftweb_prueba_tuatara'
    };
    return dataConnect;
};
