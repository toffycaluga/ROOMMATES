import express from "express";
// import axios from "axios";
import fs from "fs/promises"
import { crearUsuario, generarGastos, eliminarGastos, editarGastos } from "./utilities.js";
// const express = require('express');
// const axios = require('axios');
// const fs = require('fs').promises;

const app = express();
app.use(express.static('public'));

app.use(express.json());
// app.use(express.urlencoded({ extrended: true }));

function estado(vali) {
    console.log(`estado de solicitud:${vali.statusCode}`)
}

app.post('/roommates', async(req, res) => {
    await crearUsuario();
    estado(res);
    res.json({ hola: 'chao' })
})

app.get('/roommates', async(req, res) => {
    let db = await fs.readFile('db.json', 'utf-8');
    db = JSON.parse(db);
    estado(res);
    res.json(db)
})

app.post('/gastos', async(req, res) => {
    let body = "";
    req.on('data', async function(data) {
        body += data
    })
    req.on('end', async function(data) {
        let db = await generarGastos(body);
        // console.log(body)
        estado(res);
        res.json({ todo: 'ok' })
    });
});

app.get('/gastos', async(req, res) => {
    let db = await fs.readFile('db.json', 'utf-8')
    db = JSON.parse(db)
    estado(res);
    res.json(db)
})
app.delete('/gastos', async(req, res) => {
    const id = req.query.id;
    await eliminarGastos(id);
    estado(res);
    res.send({ todo: 'ok' });
});
app.put('/gastos', async(req, res) => {
    let body = "";
    const id = req.query.id;
    req.on('data', async function(data) {
        body += data
    })
    req.on('end', async function(data) {
        let db = await editarGastos(id, body);
        // console.log(body)
        estado(res);
        res.json({ todo: 'ok' })
    });

})

app.listen(3000, () => {
    console.log(`server started on port 3000`)
});