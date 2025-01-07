const express = require('express')
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');






const app = express()
const configviewengine = require('./src/config/viewengine');
const port = 3308
const webRouter = require('./src/routes/web')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
configviewengine(app);
app.use('/', webRouter);
app.use('/adduser', webRouter)
app.use(bodyParser.json());
app.use('/login', webRouter)
// Kết nối MongoDB Atlas



// Kết nối đến MongoDB Atlas
const uri = 'mongodb+srv://demo:123@cluster0.qdwwh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Đã kết nối thành công đến MongoDB Atlas"))
    .catch((err) => console.log("Lỗi kết nối MongoDB Atlas:", err));

// Tạo schema cho người dùng
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Tạo model cho người dùng
const User = mongoose.model('User', userSchema);

// Định nghĩa route để đăng ký tài khoản
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({
        username,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(200).json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating account" });
    }
});

// Đăng nhập người dùng
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

