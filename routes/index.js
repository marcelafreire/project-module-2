const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

let findCourse = Course.find().limit(4)
	.then((course) => {
		return course;
	})
	.catch((error) => {
		console.log('Error ', error);
	});


let findUser = (id) => {
	return User.findOne({ _id: id })
		.then((user) => {
			console.log(user);
			return user;
		})
		.catch((error) => {
			console.log('Error ', error);
		});
};

router.get('/', (req, res) => {
	let id = '';
	let loggedUser;
	if (req.user) {
		id = req.user._id;
		loggedUser = req.user;
	}
	Promise.all([ findUser(id), findCourse ])
		.then((element) => {
			console.log(element[0]);
			res.render('index', { user: element[0], course: element[1], loggedUser });
		})
		.catch((err) => console.error('Error when promising all', err));
});

module.exports = router;
