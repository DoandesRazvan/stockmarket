(function($){
    var seriesOptions = [],
        seriesCounter = 0;
        stocksAppendNames = [],
        colors = [];

    // preloading chart (empty)
    Highcharts.stockChart('stock-chart', {
        rangeSelector: {
            selected: 4
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },
        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },
        colors: colors
    });

    var chart = $('#stock-chart').highcharts()

    // dom
    const $stockcode = $('#stock-code'),
          $addstocksubmit = $('#add-stock-submit');

    // socket
    const socket = io.connect('http://localhost:3000');
    
    $('body').on('click', '.delete-button', function() {
        let stockCode = $(this).siblings('p').text();

        socket.emit('stock-delete', {
            stockCode: stockCode 
        });
    });
    
    $addstocksubmit.on('click', () => {
        let stockCode = $stockcode.val().toUpperCase();

        if (stockCode.length > 0) {
            $stockcode.val('');

            if (stocksAppendNames.indexOf(stockCode) == -1) {
                socket.emit('stock-add', {
                    stockCode: stockCode,
                });
            } else {
                alert("Stock already displayed!");
                return;
            }
        } else {
            alert("Invalid number of characters");
            return;
        }
    });

    // for stocks coming from database
    stocks.forEach((stock, index)=> {
        // getting all the colors for the stocks
        colors.push(stock[2]);

        createStock(stock);
    })

    socket.on('stock-add', (result) => {
        // getting stock color
        colors.push(result[2]);

        createStock(result);
    });

    socket.on('stock-delete', (result) => {
        for (let x = 0; x < stocksAppendNames.length; x++) {
            if(stocksAppendNames[x] == result.stockCode) {
                chart.series[x].remove();

                stocksAppendNames.splice(x, 1);
                colors.splice(x, 1);

                $('.stock').eq(x).remove();
            }
        }
    })

    function createStock(data) {
        let stockDataArr = [];
        
        data[1].forEach(stockData => {
            stockData.date = new Date(stockData.date).setUTCHours(0,0,0,0);

            stockDataArr.push([stockData.date, stockData.close]);
        });

        // reversing array from first date to current date
        stockDataArr.reverse();

        seriesOptions[seriesCounter] = {
            name: data[0],
            data: stockDataArr
        };
        
        seriesCounter += 1;
        
        // adding to chart series. seriesOptions is just to keep track of what's in the track in case it's edited.
        chart.addSeries({
            name: data[0],
            data: stockDataArr
        });

        stocksAppend(data[0], data[2]);
    }

    function stocksAppend(stockName, color) {
        if (stocksAppendNames.indexOf(stockName) == -1) {
            $('#stocks').append(`
                <div class="stock" style="background: ${color}">
                    <p>${stockName}</p>
                    <input type="submit", value="X", class="delete-button">
                </div>
            `);

            stocksAppendNames.push(stockName);
        }
    }
})(jQuery);