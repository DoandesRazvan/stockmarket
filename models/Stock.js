const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const StockSchema = new Schema({
    stock: {
        type: String,
        required: true
    },
    result: {
        type: Array,
        required: true
    },
    color: {
        type: String,
        required: true
    }
});

mongoose.model('stocks', StockSchema);