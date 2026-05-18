const Employee = require('../models/Employee');

/**
 * @desc    Add a new employee
 * @route   POST /api/employees
 * @access  Protected
 */
const addEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      res.status(400);
      throw new Error('Employee with this email already exists');
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      skills,
      performanceScore,
      experience,
    });

    res.status(201).json({
      message: 'Employee stored successfully',
      employee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Protected
 */
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search employees by department, name, or skills
 * @route   GET /api/employees/search?department=X&name=Y&skills=Z
 * @access  Protected
 */
const searchEmployees = async (req, res, next) => {
  try {
    const { department, name, skills, minScore, maxScore } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillArray };
    }

    if (minScore || maxScore) {
      filter.performanceScore = {};
      if (minScore) filter.performanceScore.$gte = Number(minScore);
      if (maxScore) filter.performanceScore.$lte = Number(maxScore);
    }

    const employees = await Employee.find(filter).sort({ performanceScore: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee by ID
 * @route   GET /api/employees/:id
 * @access  Protected
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee data
 * @route   PUT /api/employees/:id
 * @access  Protected
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete employee
 * @route   DELETE /api/employees/:id
 * @access  Protected
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  searchEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
