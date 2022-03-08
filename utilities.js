import axios from "axios";
import fs from "fs/promises"
import { send } from "./email.js";
import { v4 } from 'uuid'

function debeRecibe(db) {
    let roomCant = db.roommates.length
    let gastosTotales = 0;
    let gastosIndividuales = [];
    let recibe = [];
    let debe = []



    if (db.gastos.length >= 1) {
        for (let i = 0; i < db.roommates.length; i++) {
            gastosIndividuales.push(0);
        }

        for (let i = 0; i < db.gastos.length; i++) {
            for (let j = 0; j < db.roommates.length; j++) {
                if (db.gastos[i].roommates == db.roommates[j].nombre) {
                    gastosIndividuales[j] += db.gastos[i].monto;
                    break
                }
            }
        }

        for (let i = 0; i < db.gastos.length; i++) {
            gastosTotales = gastosTotales + db.gastos[i].monto

        }
        let gastosComunes = Math.round(gastosTotales / db.roommates.length);
        for (let i = 0; i < db.roommates.length; i++) {
            debe.push(gastosComunes)
            console.log(gastosIndividuales[i])
            if (gastosIndividuales[i] > gastosComunes) {
                recibe.push(gastosIndividuales[i] - gastosComunes);
            } else {
                recibe.push(0)
            }
            if (gastosIndividuales[i] > gastosComunes) {
                debe[i] = 0;
            } else if (gastosIndividuales < 0) {
                debe[i] = gastosComunes - gastosIndividuales[i]
            }
        }

        for (let i = 0; i < roomCant; i++) {

            db.roommates[i].id = db.roommates[i].id
            db.roommates[i].nombre = db.roommates[i].nombre
            db.roommates[i].cuota = gastosComunes
            db.roommates[i].debe = debe[i]
            db.roommates[i].recibe = recibe[i]
            db.roommates[i].correo = db.roommates[i].correo
        }

    }

    return db;

}

export async function crearUsuario() {
    const { data } = await axios.get('https://randomuser.me/api')
    const name = data.results[0].name;
    let db = await fs.readFile('db.json', 'utf-8')
    db = JSON.parse(db);
    db.roommates.push({
        id: v4(),
        nombre: `${name.first} ${name.last}`,
        cuota: 0,
        debe: 0,
        recibe: 0,
        correo: data.results[0].email
    });
    if (db.gastos.length > 0) {
        await debeRecibe(db)
    }
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
}


export async function generarGastos(data) {
    let body = JSON.parse(data)
    let db = await fs.readFile('db.json', 'utf-8');

    db = JSON.parse(db);

    db.gastos.push({
        id: v4(),
        roommates: body.roommates,
        descripcion: body.descripcion,
        monto: body.monto
    })
    await send(body);
    await debeRecibe(db)
    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
}

export async function eliminarGastos(id) {
    let db = await fs.readFile('db.json', 'utf-8');
    db = JSON.parse(db)
    for (let i = 0; i <= db.gastos.length; i++) {
        if (db.gastos[i].id == id) {
            db.gastos.splice(i, 1)
            await debeRecibe(db)
            await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
            return
        }
    }
}
export async function editarGastos(id, data) {
    let body = JSON.parse(data)
    let db = await fs.readFile('db.json', 'utf-8');
    db = JSON.parse(db)
    for (let i = 0; i <= db.gastos.length; i++) {
        if (db.gastos[i].id == id) {
            db.gastos.splice(i, 1, {
                id: id,
                roommates: body.roommates,
                descripcion: body.descripcion,
                monto: body.monto
            })
            await debeRecibe(db)
            await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');
            return

        }
    }
}