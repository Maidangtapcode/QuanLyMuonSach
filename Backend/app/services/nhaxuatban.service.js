const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.NhaXuatBan = client.db().collection("nhaxuatban");
    }

    extractNhaXuatBanData(payload) {
        const nhaxuatban = {
            MaNXB: payload.MaNXB,
            TenNXB: payload.TenNXB,
            DiaChi: payload.DiaChi,
        };
        Object.keys(nhaxuatban).forEach(
            (key) => nhaxuatban[key] === undefined && delete nhaxuatban[key]
        );
        return nhaxuatban;
    }

    async create(payload) {
        const nhaxuatban = this.extractNhaXuatBanData(payload);
        const result = await this.NhaXuatBan.insertOne(nhaxuatban);
        return await this.findById(result.insertedId);
    }

    async find(filter) {
        const cursor = await this.NhaXuatBan.find(filter);
        return await cursor.toArray();
    }

    async findByTenNXB(name) {
        return await this.find({
            TenNXB: { $regex: new RegExp(name), $options: "i" },
        });
    }
    
    async findByMaNXB(maNXB) {
        return await this.NhaXuatBan.findOne({ MaNXB: maNXB });
    }

    async findById(id) {
        return await this.NhaXuatBan.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        };
        const update = this.extractNhaXuatBanData(payload);
        const result = await this.NhaXuatBan.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.NhaXuatBan.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.NhaXuatBan.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhaXuatBanService;