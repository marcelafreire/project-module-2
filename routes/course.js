const express = require('express');
const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const Course = require('../models/course');
const User = require('../models/user');
const Review = require('../models/review');
const session = require('express-session');

const checkGuest = checkRoles('GUEST');
const checkEditor = checkRoles('EDITOR');
const checkAdmin = checkRoles('ADMIN');

//check Roles
function checkRoles(role) {
	return function(req, res, next) {
		if (req.isAuthenticated() && req.user.role === role) {
			return next();
		} else {
			res.redirect(`/course`);
		}
	};
}

router.get('/course', (req, res) => {
	res.render('course/main');
});

router.get('/course/list', (req, res) => {
	const { category, institution, stringQuery } = req.query;

	if (category) {
		Course.find({ category })
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { category, courses });
			})
			.catch((err) => console.log(err));
	} else if (institution) {
		Course.find({ institution: { $regex: institution, $options: 'i' } })
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { institution, courses });
			})
			.catch((err) => console.log(err));
	} else if (stringQuery) {
		Course.find({ name: { $regex: stringQuery, $options: 'i' } })
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { stringQuery, courses });
			})
			.catch((err) => console.log(err));
	} else {
		Course.find()
			.then((courses) => {
				console.log(courses);
				res.render('course/list', { courses });
			})
			.catch((err) => console.log(err));
	}
});

router.get('/course/add', (req, res) => {
	const formats = Course.schema.path('format').enumValues;
	const categories = Course.schema.path('category').enumValues;
	res.render('course/add', { formats, categories });
});

router.post('/course/add', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { name, institution, value, duration, format, category, text, rating } = req.body;
	const newCourse = { name, institution, value, duration, format, category };

	User.findOne({ _id: req.user.id })
		.then((writer) => {
			Review.create({ text, rating, writer }).then((review) => {
				newCourse.reviews = [ review ];
				Course.create(newCourse)
					.then((course) => {
						console.log(course);
						res.redirect('/course/list');
					})
					.catch((err) => {
						console.log(err);
						res.render('error');
					});
			});
		})
		.catch((err) => console.log(err));
});

router.get('/course/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
	const { id } = req.params;

	Course.findOne({ _id: id })
		.populate({
			path: 'reviews',
			populate: {
				path: 'writer',
				model: 'User'
			}
		})
		.then((course) => {
			//Owner Logic and Ratings
			course.reviews = course.reviews.map((review) => {
				if (review.writer && review.writer._id.toString() === req.user._id.toString()) {
					review.isOwner = true;
				}

				let ratings = [];
				for (let i = 0; i <= 5; i++) {
					ratings.push({ value: i, isRating: review.rating === i });
				}
				review.ratings = ratings;
				return review;
			});

			res.render('course/show', {
				course,
				user: req.user
			});
		})
		.catch((err) => console.log(err));
});

router.get('/course/edit/:id', (req, res) => {
	const { id } = req.params;

	Course.findOne({ _id: id })
		.populate({
			path: 'reviews',
			populate: {
				path: 'writer',
				model: 'User'
			}
		})
		.then((course) => {
			const formats = Course.schema.path('format').enumValues.map((format) => {
				return { format, selected: course.format === format };
			});
			const categories = Course.schema.path('category').enumValues.map((category) => {
				return { category, selected: course.category === category };
			});
			res.render('course/edit', { course, categories, formats });
		})
		.catch((err) => console.log(err));
});

router.post('/course/edit/:id', (req, res) => {
	const { name, institution, value, duration, format, category } = req.body;
	const { id } = req.params;

	const editCourse = { name, institution, value, duration, format, category };

	Course.findOneAndUpdate({ _id: id }, editCourse, { new: true })
		.then((course) => {
			console.log(course);
			res.redirect(`/course/edit/${course._id}`);
		})
		.catch((err) => console.log(err));
});

router.get('/course/delete/:id', (req, res) => {
	const { id } = req.params;

	Course.findByIdAndDelete(id)
		.then((course) => {
			console.log(course);
			res.redirect('/course/list');
		})
		.catch((err) => console.log(err));
});

module.exports = router;
