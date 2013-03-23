module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var destinationSchema = new Schema({
		name: String,
    location: String,
		address: {
      streetAddress: String,
      state: String,
      city: String,
		  zip: String,
      shortName: String,
      country: String
		},
    type: String
	});

	this.model = mongoose.model('Destination', destinationSchema);

	return this;
}