var mongoose = require('mongoose');
productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

 name: {
      type: String
  },
  categories:{
      type: String
  },
  price: {
      type: Number
  },
  date:{
      type: String
  }
});
module.exports = mongoose.model('Product', productSchema);