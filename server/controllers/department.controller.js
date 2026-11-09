const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

/**
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Public
 */
const getDepartments = async (req, res, next) => {
  try {
    const { all } = req.query;
    // By default, public sees active departments only; admin can request all=true
    const query = all === 'true' && req.user && ['admin', 'receptionist'].includes(req.user.role)
      ? {}
      : { isActive: true };

    const departments = await Department.find(query).sort({ name: 1 });

    // Count doctors for each department
    const departmentsWithDoctorCount = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({
          departmentId: dept._id,
          isActive: true,
        });
        return {
          ...dept.toObject(),
          doctorCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithDoctorCount.length,
      departments: departmentsWithDoctorCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single department by ID
 * @route   GET /api/departments/:id
 * @access  Public
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    const doctors = await Doctor.find({ departmentId: department._id, isActive: true })
      .populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      department,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Private (Admin only)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Department name and description are required.',
      });
    }

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department with name '${name}' already exists.`,
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description.trim(),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department
 * @route   PUT /api/departments/:id
 * @access  Private (Admin only)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    // Check name uniqueness if changed
    if (name && name.trim().toLowerCase() !== department.name.toLowerCase()) {
      const duplicate = await Department.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id },
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Department with name '${name}' already exists.`,
        });
      }
      department.name = name.trim();
    }

    if (description !== undefined) department.description = description.trim();
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle department active status or delete
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin only)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    // Check if there are active doctors associated with this department
    const associatedDoctors = await Doctor.countDocuments({
      departmentId: department._id,
      isActive: true,
    });

    if (associatedDoctors > 0) {
      // Soft deactivate instead of hard delete to preserve referential integrity
      department.isActive = false;
      await department.save();
      return res.status(200).json({
        success: true,
        message: `Department deactivated. ${associatedDoctors} active doctor(s) are still assigned to this department.`,
        department,
      });
    }

    // If no active doctors, delete department
    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Department removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
