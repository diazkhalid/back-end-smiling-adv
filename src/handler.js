import fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import DateHelper from './date-helper.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg'
const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const URL = `postgres://ananda.diaz1202:tu0sdbr7mjxh@ep-rapid-rice-384125-pooler.ap-southeast-1.aws.neon.tech/neondb`;
const pool = new Pool({
    connectionString: URL,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require',
    },
});

const getImgByIdHandler = (req, res) => {
    const { idS, id } = req.params;
    const idStory = parseInt(idS);
    const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA-IMG.json'));
    const jsonData = JSON.parse(data);
    const imageData = jsonData.picture.find((story) => story.idStory === idStory);
    const image = imageData.fileImg.find((img) => img.id === id);

    if (!image) {
        return res.send('Gambar tidak ditemukan');
    }
    const { fileName } = image;

    const imagePath = path.join(__dirname, 'assets', fileName);

    return res.sendFile(imagePath);
};

const getThumbByIdHandler = (request, res) => {
    try {
        const imageId = parseInt(request.params.id);
        const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA-IMG.json'));
        const jsonData = JSON.parse(data);
        const thumbnailImg = jsonData.thumbnail.find((thumb) => thumb.id === imageId);

        if (thumbnailImg) {
            const { fileName } = thumbnailImg;
            const imagePath = path.join(__dirname, 'assets', fileName);

            return res.sendFile(imagePath);
        }
        return res.send('Data not found');
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const getAllBooks = (req, res) => {
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA.json'));
        const data = JSON.parse(jsonData);
        res.send(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const getBookByIdHandler = (req, res) => {
    try {
        const { id } = req.params;
        const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA.json'));
        const jsonData = JSON.parse(data);
        const story = jsonData.stories.find((story) => story.id === id);

        if (story) {
            return res.send(story);
        }
        return res.send('Data not found');
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return res.send('Error');
    }
};

const searchStoryHandler = async (req, res) => {
    const { title } = req.query;
    const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA.json'));
    const jsonData = JSON.parse(data);
    const result = jsonData.stories.filter((story) => story.title.toLowerCase().replace(/\s/g, '').includes(title.toLowerCase().replace(/\s/g, '')));

    return res.send(result);
};

const addingRev = async (req, res) => {
    const { id, name, review } = req.body || {};
    if (!id || !name || !review) {
        return res.status(400).send('Payload tidak valid');
    }

    const id_review = nanoid(8);
    const DATE = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' });
    const inDate = new Date(DATE);
    const year = inDate.getFullYear();
    const month = String(DateHelper.monthNameChecker(inDate.getMonth() + 1));
    const day = String(inDate.getDate());
    const date = `${day} ${month} ${year}`;
    const query = `
        INSERT INTO review (id_review, id_story, nama, tanggal, isi_review)
        VALUES ($1, $2, $3, $4, $5) RETURNING id_review, id_story, nama, tanggal, isi_review
    `;
    const values = [id_review, id, name, date, review];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const getReviewById = async (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT * FROM review WHERE id_story = $1
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const deleteReviewByRevId = async (req, res) => {
    const { id } = req.params;
    const query = `
            DELETE FROM review WHERE id_review = $1 RETURNING id_review, id_story, nama, tanggal, isi_review
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const getAllReviewOrderByDate = async (req, res) => {
    const query = `
            SELECT * FROM review ORDER BY tanggal ASC
    `;
    const { rows } = await pool.query(query);
    res.send(rows);
}

const getStoryCount = async (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA.json'));
    const jsonData = JSON.parse(data);

    const storyCount = jsonData.stories.length.toString();
    res.send(storyCount);
}

const getReviewCount = async (req, res) => {
    const query = 'SELECT COUNT(*) AS total FROM review';
    const { rows } = await pool.query(query);
    const total = rows[0].total;
    res.send(total.toString());
}
const getCount = async (req, res) => {
    const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA.json'));
    const jsonData = JSON.parse(data);
    const totalCerita = jsonData.stories.length;
    const query = 'SELECT COUNT(*) AS total FROM review';
    const queryMsg = 'SELECT COUNT(*) AS total FROM pesan';
    const { rows: reviewsRows } = await pool.query(query);
    const { rows: messageRows } = await pool.query(queryMsg);
    const totalReview = reviewsRows[0].total;
    const totalPesan = messageRows[0].total;
    const datas = [
        { title: 'Cerita', idDashImg: '1', total: totalCerita },
        { title: 'Review', idDashImg: '2', total: totalReview },
        { title: 'Pesan', idDashImg: '3', total: totalPesan },
    ];
    res.send(datas);
}

const getDashboardImg = async (req, res) => {
    const imageId = req.params.id;
    const data = fs.readFileSync(path.join(__dirname, 'assets/data', 'DATA-IMG.json'));
    const jsonData = JSON.parse(data);
    const dashboardImg = jsonData.dashboard.find((dash) => dash.id === imageId);

    if (dashboardImg) {
        const { fileName } = dashboardImg;
        const imagePath = path.join(__dirname, 'assets', fileName);

        return res.sendFile(imagePath);
    }
    return res.send('Data not found');
}

const sendMsg = async (req, res) => {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
        return res.status(400).send('Payload tidak valid');
    }

    const id_pesan = nanoid(8);
    const query = `
        INSERT INTO pesan (id_pesan, nama, email, isi_pesan)
        VALUES ($1, $2, $3, $4) RETURNING id_pesan, nama, email, isi_pesan
    `;
    const values = [id_pesan, name, email, message];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const getAllMsg = async (req, res) => {
    const query = `
            SELECT * FROM pesan ORDER BY nama ASC
    `;
    const { rows } = await pool.query(query);
    res.send(rows);
}

const deleteMsgByMsgId = async (req, res) => {
    const { id } = req.params;
    const query = `
            DELETE FROM pesan WHERE id_pesan= $1 RETURNING id_pesan, nama, email, isi_pesan
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}

const getAdminByUsername = async (req, res) => {
    const { username } = req.params;
    const query = `
            SELECT * FROM admin WHERE username = $1
    `;
    const values = [username];
    const { rows } = await pool.query(query, values);
    res.send(rows);
}


export { getAllBooks, getBookByIdHandler, getImgByIdHandler, getThumbByIdHandler, searchStoryHandler, addingRev,
        getReviewById, deleteReviewByRevId, getAllReviewOrderByDate, getStoryCount, getReviewCount, getCount,
        getDashboardImg, sendMsg, getAllMsg, deleteMsgByMsgId, getAdminByUsername};