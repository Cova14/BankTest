// Hey! So you want to know how this code works? Well... You'll find bad sintaxis ):
// But hopefully I can explain all this good enough so can get an idea of what am I doing

// All this are the libraries we need 
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

// We define variables to use Neo4j, "Db URL" will be bolt:..., username "Neo4j" and the password "polish...".
// All this is defined by the neo4j sandbox and has to be updated every 2/3 days.
// If you need to use a new db just go to the Neo4j Sandbox and copy the new data. You only need the "driver" variable.
// The new db will be empty, so first of all add a Bank with the name "BANORTE", then click on the "Importar" button.
var driver = neo4j.driver('bolt://34.239.207.52:32955', neo4j.auth.basic('neo4j', 'polish-splicers-rifles'));
var session = driver.session();

// Each time we use app.get() we want to GET data to show in the browser
// app.get takes to props, the url and the function
// '/' it's for the "principal page", for example, in this case we run the app.js and the port we use is 3000
// So when we go to localhost:3000, the app will execute the code below
app.get('/', function(req, res) {

    // With "session" we make a connection with Neo4j
    // session uses 3 functions: .run(), .then(), .catch() ... I think the function names are self explanatory
    // Any way, in .run() we ask for something, in this case we use Cypher(Neo4j db language) to get data
    // .then() What we want to do with the data?
    // .catch() Just for errors
    session
        .run('MATCH(b:Banco) RETURN b') // We ask for every Bank we have
        .then(function(result){
            var bancoArr = []; // We make an empty array 
            result.records.forEach(function(record){
                bancoArr.push({ //We push id and name into the array for each bank we have
                    id: record._fields[0].identity.low,
                    nombre: record._fields[0].properties.nombre
                });
                // Here we're writing a JSON file with the same data we push into the array ^
                var data = JSON.stringify(bancoArr); // Stringify the data
                    fs.writeFile('bancos.json', data, finished); // Then write the file('Filename', data to write, function)

                    function finished(err){
                    };
            });
            // We have more query's, so before we close the .then() function, we write everything we need
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
                                // Here we are sending all the data to the index.ejs
                                // So we can use it in the page
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

// The same above but posting data
app.post('/bank/add',function(req, res){ // Here we catch the data with a "URL" to connect the page to this code
    var nombre = req.body.nombre;

    session
        .run('CREATE(n:Banco {nombre:{nombreParam}}) RETURN n.nombre', {nombreParam:nombre}) // We write what we want to create and instead of  passing direct data, we use Params
        .then(function(result){
            res.redirect('/'); // Then when the query it's done, just redirect to the main page

            session.close(); // We add session.close() to stop the query
        })
        .catch(function(err){
            console.log(err);
        });

    res.redirect('/');
});

// This is the code to import the file we have same ass creating a bank but with lot more properties
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

app.get('/graphic', function(req,res){ // This code will run when we go to localhost:3000/graphic
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
                    // As we did with the index data, we return this data to graphic.ejs
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

app.listen(3000); //We declare the port we want to use
console.log('Server started on port 3000')

module.exports = app;