const config = {
    app: {
        port: process.env.PORT || 3000, 
    },
    db: {
        uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach"
    },
    jwt: {
        secret: process.env.JWT_SECRET || "112401082004"
    }
};
module.exports = config;