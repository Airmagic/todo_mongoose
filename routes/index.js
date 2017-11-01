var express = require('express');
var router = express.Router();
var Task = require('../models/task');

/* GET home page with all incomplete tasks */
router.get('/', function(req, res, next) {
  
  Task.find({completed: false})
	.then( (docs) => {
		res.render('index', {title: 'Incomplete Tasks', tasks: docs})
	})
	.catch( (err) => {
		next(err);
	});

});


/* GET details about one task */
router.get('/task/:_id', function(req, res, next) {
  
  Task.findOne({_id: req.params._id})
	.then((task) => {
		if (task){
			res.render('task', {title: 'Task', task: task});
		}
		else {
			res.status(404).send('Task Not Found');
		}
	})
      .catch((err) => {
        next(err);
      })
});


/* GET completed tasks */
router.get('/completed', function(req, res, next){
  
  Task.find({completed:true} )
	.then( (docs) => {
		res.render('task_completed', { title: 'completed tasks', tasks: docs });
		}).catch( (err) => {
    next(err);
  });
  
  });
  



/* POST new task */
router.post('/add', function(req, res, next){
  
  if (!req.body || !req.body.text) {
    //no task text info, redirect to home page with flash message
    req.flash('error', 'Where\'s the beef?');
    res.redirect('/');
  }
  
  else {
    //Insert into database. New tasks are assumed to be not completed.
    new Task( { text: req.body.text, completed: false} ).save()
		.then ((newTask) => {
			console.log('The new task is created is: ', newTask);
			res.redirect('/');
		})
      .catch((err) => {
        next(err);   // most likely to be a database error.
      });
  }
  
});


/* POST task done */
router.post('/done', function(req, res, next){
  
  Task.findOneAndUpdate( {_id: req.body._id}, {$set: {completed: true}})
	.then((updatedTask) => {
		if (updatedTask) {
			res.redirect('/')
			}
		else {
			res.status(404).send("Error marking task done: not found");
		}
	})
      .catch((err) => {
        next(err);        // For database errors, or malformed ObjectIDs.
      })
  
});

/* POST all tasks done */
router.post('/alldone', function(req, res, next) {
  
	Task.updateMany({ completed: false }, {$set : {completed : true}})
	.then((result) => {
		console.log("How many documents were modified?", result.n);
		req.flash('info', 'All tasks marked as done!');
		res.redirect('/');
	})
    .catch( (err) => {
      next(err);
    })
});



/* POST task delete */
router.post('/delete', function(req, res, next){

	Task.deleteOne({_id : req.body._id })
		.then((result) => {
			if (result.deleteCount === 1) {
				res.direct('/');
			}
			else {
				restatus(404).send('Error deleting task: not found');
			}
		})
      .catch((err) => {
        next(err);
      });
  });
  


module.exports = router;