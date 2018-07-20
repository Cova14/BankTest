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


var driver = neo4j.driver('bolt://54.236.48.119:32819', neo4j.auth.basic('neo4j', 'pitch-housefall-deduction'));
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
                .run('MATCH(b:Banco)-[r:RETIRO]->(n) RETURN r ORDER BY r.cantidad')
                .then(function(result){
                    var retirosArr = [];
                    result.records.forEach(function(record){
                        retirosArr.push({
                            id: record._fields[0].identity.low,
                            cantidad: record._fields[0].properties.cantidad
                        });
                        var data = JSON.stringify(retirosArr);
                        fs.writeFile('retiros.json', data, finished);

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
                        })
                        .catch(function(err){
                        console.log(err);
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
        .run('LOAD CSV WITH HEADERS FROM "https://cova14.github.io/BankTest/files/BANORTE_ASCEND.txt" AS row MATCH(b:Banco) MERGE(b)-[r:RETIRO{cantidad:row.Retiros}]->(n:Movimiento {cuenta:row.Cuenta, fechaOperacion:row.Fecha_de_Operacion, fecha:row.Fecha, referencia:row.Referencia, descripcion:row.Descripcion, codTransac:row.Cod_Transac, sucursal:row.Sucursal, saldo:row.Saldo, movimiento:row.Movimiento, descripcionDetallada:row.Descripcion_Detallada})-[re:DEPOSITO{cantidad:row.Depositos}]->(b)')
        .then(function(result){
            res.redirect('/');

            session.close();
        })
        .catch(function(err){
            console.log(err)
        });
    res.redirect('/');
});


app.listen(3000);
console.log('Server started on port 3000')

module.exports = app;