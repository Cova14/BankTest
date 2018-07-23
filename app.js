// Todo esto son librerías necesarias para que funcione
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');
var neo4j = require('neo4j-driver').v1;

var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));


var driver = neo4j.driver('bolt://34.239.207.52:32955', neo4j.auth.basic('neo4j', 'polish-splicers-rifles'));
var session = driver.session();

app.get('/', function(req, res) {
    session
        .run('MATCH(b:Banco) RETURN b')
        .then(function(result){
            var bancoArr = [];
            result.records.forEach(function(record){
                bancoArr.push({
                    id: record._fields[0].identity.low,
                    nombre: record._fields[0].properties.nombre
                });
                var data = JSON.stringify(bancoArr);
                    fs.writeFile('bancos.json', data, finished);

                    function finished(err){
                    };
            });
            session
                .run('MATCH(b:Banco)-[r:RETIRO{fecha:"01/03/2018"}]->(n) RETURN r ORDER BY r.cantidad')
                .then(function(result){
                    var retirosArr = [];
                    var totalRetiros = 0;
                    var fecha = '';
                    result.records.forEach(function(record){
                        var retiro = record._fields[0].properties.cantidad;
                        retiro = retiro.replace(/,/g, "");
                        total = parseFloat(retiro);
                        totalRetiros += total;
                        fecha = record._fields[0].properties.fecha;
                        retirosArr.push({
                            id: record._fields[0].identity.low,
                            cantidad: record._fields[0].properties.cantidad,
                            fecha: record._fields[0].properties.fecha
                        });
                        var data = JSON.stringify(retirosArr);
                        fs.writeFile('retiros.json', data, finished);

                        function finished(err){
                        };
                    });
                    session
                        .run('MATCH(b:Banco)-[r:RETIRO{fecha:"02/03/2018"}]->(n) RETURN r ORDER BY r.cantidad')
                        .then(function(result){
                            var retirosArr1 = [];
                            var totalRetiros1 = 0;
                            var fecha1 = '';
                            result.records.forEach(function(record){
                                var retiro1 = record._fields[0].properties.cantidad;
                                retiro1 = retiro1.replace(/,/g, "");
                                total1 = parseFloat(retiro1);
                                totalRetiros1 += total1;
                                fecha1 = record._fields[0].properties.fecha;
                                retirosArr1.push({
                                    id: record._fields[0].identity.low,
                                    cantidad: record._fields[0].properties.cantidad,
                                    fecha: record._fields[0].properties.fecha
                                });
                                var data = JSON.stringify(retirosArr1);
                                fs.writeFile('retiros1.json', data, finished);

                                function finished(err){
                                };
                            });
                            session
                                .run('MATCH(m:Movimiento) RETURN m')
                                .then(function(result){
                                    var movPropArr = [];
                                    result.records.forEach(function(record){
                                        movPropArr.push({
                                            properties: record._fields[0].properties
                                        });
                                        var data = JSON.stringify(movPropArr);
                                        fs.writeFile('movProps.json', data, finished);

                                        function finished (err){

                                        };
                                    });
                                })
                                res.render('index', {
                                    bancos: bancoArr,
                                    retiros: retirosArr,
                                    totalRetiros: totalRetiros.toFixed(2),
                                    fecha: fecha,
                                    retiros1: retirosArr1,
                                    totalRetiros1: totalRetiros1.toFixed(2),
                                    fecha1: fecha1,
                                })
                                .catch(function(err){
                                console.log(err);
                                });
                        })
                        .catch(function(err){
                            console.log(err)
                        });   
                })
                .catch(function(err){
                    console.log(err);
                });
        })
        .catch(function(err){
            console.log(err);
        });
});

app.post('/bank/add',function(req, res){
    var nombre = req.body.nombre;

    session
        .run('CREATE(n:Banco {nombre:{nombreParam}}) RETURN n.nombre', {nombreParam:nombre})
        .then(function(result){
            res.redirect('/');

            session.close();
        })
        .catch(function(err){
            console.log(err);
        });

    res.redirect('/');
});

app.post('/file/add',function(req,res){
    session
        .run('LOAD CSV WITH HEADERS FROM "https://cova14.github.io/BankTest/files/BANORTE_ASCEND.txt" AS row MATCH(b:Banco{nombre:"BANORTE"}) CREATE(b)-[r:RETIRO{cantidad:row.Retiros, fecha:row.Fecha_de_Operacion}]->(n:Movimiento {cuenta:row.Cuenta, fecha:row.Fecha, referencia:row.Referencia, descripcion:row.Descripcion, codTransac:row.Cod_Transac, sucursal:row.Sucursal, saldo:row.Saldo, movimiento:row.Movimiento, descripcionDetallada:row.Descripcion_Detallada})-[re:DEPOSITO{cantidad:row.Depositos, fecha:row.Fecha_de_Operacion}]->(b)')
        .then(function(result){
            res.redirect('/');

            session.close();
        })
        .catch(function(err){
            console.log(err)
        });
    res.redirect('/');
});

app.get('/graphic', function(req,res){
    session
        .run('MATCH(b:Banco)-[r:RETIRO{fecha:"01/03/2018"}]->(n) RETURN r')
        .then(function(result){
            var totalRetiros = 0;
            var fecha = '';
            result.records.forEach(function(record){
                var retiro = record._fields[0].properties.cantidad;
                retiro = retiro.replace(/,/g, "");
                total = parseFloat(retiro);
                totalRetiros += total;
                fecha = record._fields[0].properties.fecha;
            });
            session
                .run('MATCH(b:Banco)-[r:RETIRO{fecha:"02/03/2018"}]->(n) RETURN r')
                .then(function(result){
                    var totalRetiros1 = 0;
                    var fecha1 = '';
                    result.records.forEach(function(record){
                        var retiro1 = record._fields[0].properties.cantidad;
                        retiro1 = retiro1.replace(/,/g, "");
                        total1 = parseFloat(retiro1);
                        totalRetiros1 += total1;
                        fecha1 = record._fields[0].properties.fecha;
                    });
                    res.render('graphic', {
                        total: totalRetiros.toFixed(2),
                        fecha: fecha.split('/').reverse().join(', '),
                        total1: totalRetiros1.toFixed(2),
                        fecha1: fecha1.split('/').reverse().join(', ')
    
                    })
                })
                .catch(function(err){
                    console.log(err);
                });
        })
        .catch(function(err){
            console.log(err);
        });
});

app.listen(3000);
console.log('Server started on port 3000')

module.exports = app;