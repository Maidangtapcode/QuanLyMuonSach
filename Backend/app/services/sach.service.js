const { ObjectId } = require("mongodb");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("sach");
    }

    extractSachData(payload) {
        const sach = {
            MaSach: payload.MaSach,
            TenSach: payload.TenSach,
            DonGia: payload.DonGia,
            SoQuyen: payload.SoQuyen,
            NamXuatBan: payload.NamXuatBan,
            MaNXB: payload.MaNXB,
            TacGia: payload.TacGia,
            HinhAnh: payload.HinhAnh,
            SoQuyenHienCo: payload.SoQuyenHienCo,
            TheLoai: payload.TheLoai,
            MoTa: payload.MoTa
        };

        Object.keys(sach).forEach(
            (key) => sach[key] === undefined && delete sach[key]
        );
        return sach;
    }

    async create(payload) {
        const sach = this.extractSachData(payload);
        sach.soQuyenHienCo = sach.SoQuyen;
        const result = await this.Sach.insertOne(sach);
        return await this.findById(result.insertedId);
    }

    async find(filter) {
        const cursor = await this.Sach.find(filter);
        return await cursor.toArray();
    }
    async findBySearch(searchText) {
        const filter = {
            $or: [
                
                { TenSach: { $regex: new RegExp(searchText), $options: "i" } },
                { MaSach: { $regex: new RegExp(searchText), $options: "i" } }
            ]
        };
        
        return await this.find(filter); 
    }
    async findByTenSach(name) {
        return await this.find({
            TenSach: { $regex: new RegExp(name), $options: "i" },
        });
    }
    
    async findByMaSach(maSach) {
        return await this.Sach.findOne({ MaSach: maSach });
    }

    async findById(id) {
        return await this.Sach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        };
        const update = this.extractSachData(payload);
        const result = await this.Sach.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.Sach.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Sach.deleteMany({});
        return result.deletedCount;
    }

    async updateStockByMaSach(maSach, change) {
        const filter = { MaSach: maSach };
        const update = { 
            // $inc tăng/giảm gái trị của mongodb
            $inc: { soQuyenHienCo: change } 
        };
        
        const result = await this.Sach.findOneAndUpdate(
            filter,
            update,
            { returnDocument: "after" }
        );
        return result.value;
    }
    async getCategories() {
        // distinct() là để lấy giá trị unique của mongo
        const categories = await this.Sach.distinct("TheLoai");
        return categories.filter(c => c); //bỏ giá trị null/empty
    }
}

module.exports = SachService;