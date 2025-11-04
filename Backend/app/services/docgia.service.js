const { ObjectId } = require("mongodb");

class DocGiaService {
    constructor(client) {
        this.DocGia = client.db().collection("docgia");
    }

    extractDocGiaData(payload) {
        const docgia = {
            MaDocGia: payload.MaDocGia,
            HoLot: payload.HoLot,
            Ten: payload.Ten,
            NgaySinh: payload.NgaySinh,
            Phai: payload.Phai,
            DiaChi: payload.DiaChi,
            DienThoai: payload.DienThoai,
            Password: payload.Password, 
        };
        Object.keys(docgia).forEach(
            (key) => docgia[key] === undefined && delete docgia[key]
        );
        return docgia;
    }

    async create(payload) {
        const docgia = this.extractDocGiaData(payload);
        const result = await this.DocGia.insertOne(docgia);
        return await this.findById(result.insertedId);
    }

    async find(filter) {
        const cursor = await this.DocGia.find(filter);
        return await cursor.toArray();
    }

    async findByTen(name) {
        return await this.find({
            $or: [
                { HoLot: { $regex: new RegExp(name), $options: "i" } },
                { Ten: { $regex: new RegExp(name), $options: "i" } }
            ]
        });
    }
    
    async findByMaDocGia(maDocGia) {
        return await this.DocGia.findOne({ MaDocGia: maDocGia });
    }

    async findById(id) {
        return await this.DocGia.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        };
        const update = this.extractDocGiaData(payload);
        const result = await this.DocGia.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.DocGia.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.DocGia.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = DocGiaService;