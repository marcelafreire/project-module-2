const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
	name: String,
	institution: String,
	image: String,
	value: Number,
	duration: Number, //Duration in hours
	format: { type: String, enum: [ 'online', 'presencial' ] },
	category: {
		type: String,
		enum: [
			'Desenvolvimento Web',
			'Ciência de Dados',
			'Aplicativos Mobile',
			'Desenvolvimento de Jogos',
			'Banco de Dados',
			'E-Commerce'
		]
	},
	reviews: [ { review: String, rating: Number } ]
	// owner: { type: Schema.Types.ObjectId, ref: 'Story' }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
