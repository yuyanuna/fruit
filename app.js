const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sqlite3 = require('sqlite3').verbose();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 連結資料庫
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// 新增price的API
app.post('/api/price', (req, res) => {
    const { date, price, volume } = req.body;
    const sql = `INSERT INTO price (date, price, volume) VALUES (?, ?, ?)`;
    db.run(sql, [date, price, volume], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// 查询價格的API
app.get('/api/price', (req, res) => {
    const { search } = req.query;
    let sql = `SELECT * FROM price`;
    if (search) {
        sql += ` WHERE date LIKE ?`;
    }
    db.all(sql, search ? [`%${search}%`] : [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ products: rows });
    });
});

// 確認資料庫的連結
app.get('/test/database', (req, res) => {
    db.get('SELECT * FROM price LIMIT 1', (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).send('Error querying database');
        }
        res.json({ success: true, data: row });
    });
});

// 使用路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
