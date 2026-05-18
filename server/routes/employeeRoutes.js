const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  addEmployee,
  getEmployees,
  searchEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

// Search route must come before /:id to avoid conflicts
router.get('/search', protect, searchEmployees);

router.route('/')
  .get(protect, getEmployees)
  .post(protect, addEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee)
  .delete(protect, deleteEmployee);

module.exports = router;
