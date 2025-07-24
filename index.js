require('dotenv').config() // 加载环境变量
const express = require('express')
const { Pool } = require('pg')

const cors = require('cors')


const app = express()
const PORT = process.env.PORT || 3000



// 中间件
app.use(cors()); // 启用跨域
app.use(express.json()); // 解析JSON请求体


//connect to database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dandan:zky68T3IFGlJk34O6yU4Ts911oRhU5um@dpg-d1vsqg7diees73c0q570-a.oregon-postgres.render.com/firstdb_p58o?sslmode=require',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

//测试数据库连接
async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected at:', res.rows[0].now);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // 如果数据库连接失败，退出应用
    }
}

testConnection()

app.get('/', (req, res) => {
    res.send('Hello World from Render with Sequelize!')
})

app.post('/users', async (req, res) => {
    const { name, email } = req.body
    const createdAt = new Date().toISOString().split('T')[0]
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, created_at) VALUES ($1, $2, $3) RETURNING *',
            [name, email, createdAt]
        )
        res.json(result.rows[0])
    } catch (err) {
        console.error('Insert error:', err)
        res.status(500).send('Error inserting user')
    }
})




app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users')
        res.json(result.rows)
    } catch (err) {
        console.error('Query error:', err)
        res.status(500).send('Error fetching users')
    }
})

// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM received - shutting down');
    server.close(() => pool.end().then(() => process.exit(0)));
});

process.on('SIGINT', () => {
    console.log('SIGINT received - shutting down');
    server.close(() => pool.end().then(() => process.exit(0)));
});