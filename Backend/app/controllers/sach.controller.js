const SachService = require("../services/sach.service"); 
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.MaSach || !req.body?.TenSach) {
        return next(new ApiError(400, "MaSach and TenSach can not be empty"));
    }

    try {
        const sachService = new SachService(MongoDB.client); 
        const existing = await sachService.findByMaSach(req.body.MaSach); 
        if (existing) {
            return next(new ApiError(409, "MaSach already exists")); 
        }
        
        const document = await sachService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the book") 
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const sachService = new SachService(MongoDB.client);
        const { searchText, TheLoai } = req.query; 
        const filter = {};
        if (TheLoai) {
            filter.TheLoai = TheLoai; 
        }
        if (searchText) {
            filter.$or = [
                { TenSach: { $regex: new RegExp(searchText), $options: "i" } },
                { MaSach: { $regex: new RegExp(searchText), $options: "i" } }
            ];
        }
        documents = await sachService.find(filter); 

    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving books")
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client); 
        const document = await sachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found")); 
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving book with id=${req.params.id}`) 
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const sachService = new SachService(MongoDB.client); 
        const document = await sachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found")); 
        }
        return res.send({ message: "Book was updated successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Error updating book with id=${req.params.id}`) 
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client); 
        const document = await sachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found")); 
        }
        return res.send({ message: "Book was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete book with id=${req.params.id}`) 
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client); 
        const deletedCount = await sachService.deleteAll();
        return res.send({
            message: `${deletedCount} books were deleted successfully`, 
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all books") 
        );
    }
};
exports.findAllCategories = async (req, res, next) => {
    try {
        const sachService = new SachService(MongoDB.client);
        const documents = await sachService.getCategories();
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving categories")
        );
    }
};