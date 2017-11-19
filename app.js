const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      socket = require('socket.io'),
      yahooFinance = require('yahoo-finance'),
      gen = require('color-generator'),
      app = express(),
      port = process.env.PORT || 3000;

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds113566.mlab.com:13566/thestockmarket',{useMongoClient: true});

app.use(express.static(path.join(__dirname, 'public')));

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// places schema
require('./models/Stock');
const Stock = mongoose.model('stocks');

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    Stock.find({})
         .then(stocks => {
             let stocksArr = [];

             stocks.forEach(object => {
                 stocksArr.push([object.stock, object.result, object.color]);
             });

             res.render('./2-sections/index', {stocksArr: stocksArr});
         });
});

const server = app.listen(port);

// socket
const io = socket(server);

io.on('connection', (socket) => {
    socket.on('stock-add', (data) => {
        var toDate = new Date(),
            fromDate = new Date()
            stockCode = data.stockCode;
        
        fromDate.setFullYear(toDate.getFullYear() - 1);
    
        yahooFinance.historical({
            symbol: stockCode,
            from: fromDate,
            to: toDate
        }, (err, result) => {
            if (result) {
                let color = gen(0.8, 0.75).hexString();

                // no color duplicates
                Stock.find({})
                     .then(stocks => {
                        let colors = [];

                        stocks.forEach(stock => {
                            colors.push(stock.color);
                        });

                        while (colors.indexOf(color) != -1) {
                            color = gen(0.8, 0.75).hexString();
                        }
                     });
                
                let stock = new Stock({
                    stock: stockCode,
                    result: result,
                    color: color
                });
            
                stock.save()
                    .then(object => {
                        io.sockets.emit('stock-add', [object.stock, object.result, object.color]);
                    });
            } else 
                throw err;
        });
    });

    socket.on('stock-delete', (data) => {
        Stock.findOne({stock: data.stockCode})
             .then(stock => {
                 if (stock) {
                    io.sockets.emit('stock-delete', {stockCode: stock.stock});
                    stock.remove();
                 }
             });
    })
});