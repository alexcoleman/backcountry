module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var userSchema = new Schema({
		id: Number,
		name: String,
    location: String,
		activity: [
      {
        destinationId: String,
        destinationName: String,
        gear: [
          {
            id: String,
            category: String,
            product: {
              backcountryId: String,
              brandName: String,
              productName: String,
              url: String,
              imageUrl: String
            }
          }
        ],
        friends: [
          {
            id: String,
            name: String 
          }
        ]
  		}
    ],
    review: [
      {
        userId: String,
        name: String,
        content: String,
        addDate: {type:Date, default: Date.now}
      }
    ]
	});

	this.model = mongoose.model('User', userSchema);

	return this;
}