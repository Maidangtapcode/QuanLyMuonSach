const NhanVienService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error.js");
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcryptjs"); 
const config = require("../config/index.js");

exports.create = async (req, res, next) => {
    //Kiểm tra MSNV và Password
    if (!req.body?.MSNV || !req.body?.Password) {
        return next(new ApiError(400, "MSNV and Password can not be empty"));
    }
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const existing = await nhanVienService.findByMSNV(req.body.MSNV);
        if (existing) {
            return next(new ApiError(409, "MSNV already exists")); 
        }
        const document = await nhanVienService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.log(error); // in log lỗi 
        return next(
            new ApiError(500, "An error occurred while creating the employee")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const { name } = req.query; 
        if (name) {
            documents = await nhanVienService.findByHoTenNV(name);
        } else {
            documents = await nhanVienService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving employees")
        );
    }
    return res.send(documents);
};


exports.findOne = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.findByMSNV(req.params.MSNV);
        if (!document) {
            return next(new ApiError(404, "Employee not found")); 
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving employee with MSNV=${req.params.MSNV}`) 
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Employee not found")); 
        }
        return res.send({ message: "Employee was updated successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Error updating employee with id=${req.params.id}`) 
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const document = await nhanVienService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Employee not found")); 
        }
        return res.send({ message: "Employee was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete employee with id=${req.params.id}`) 
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const deletedCount = await nhanVienService.deleteAll();
        return res.send({
            message: `${deletedCount} employees were deleted successfully`, 
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all employees")
        );
    }
};

exports.login = async (req, res, next) => {
    if (!req.body?.MSNV || !req.body?.Password) {
        return next(new ApiError(400, "MSNV and Password are required"));
    }
    try {
        const nhanVienService = new NhanVienService(MongoDB.client);
        const user = await nhanVienService.findByMSNV(req.body.MSNV);
        if (!user) {
            return next(new ApiError(401, "Incorrect MSNV or Password"));
        }
        const passwordMatch = await bcrypt.compare(
            req.body.Password,
            user.Password 
        );

        if (!passwordMatch) {
            return next(new ApiError(401, "Incorrect MSNV or Password"));
        }
        const token = jwt.sign(
            { userId: user._id, msnv: user.MSNV, role: "nhanvien" }, 
            config.jwt.secret, 
            { expiresIn: "1h" } 
        );
        const { Password, ...userWithoutPassword } = user;
        
        return res.send({
            message: "Login successful",
            token: token,
            user: userWithoutPassword
        });

    } catch (error) {
        return next(new ApiError(500, "An error occurred during login"));
    }
};

