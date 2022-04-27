const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//  middleware
app.use(cors());
app.use(express.json());

//  authorization token decoded middleware

const verifyToken = (req, res, next) => {
    const headersToken = req.headers.authorization;
    if (!headersToken) {
        res.status(401).send({ massage: 'unAuthorize access' })
    }
    const token = headersToken.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            res.status(401).send({ massage: 'unAuthorize access' })
        }
        req.decoded = decoded;
        next()
    });
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.grvhn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('Car-Service').collection('service');
        const orderServiceCollection = client.db('Booked-service').collection('service');


        // AUTH USER Giv user Token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN);
            res.send({ token });
        })



        //  load all data 
        app.get('/service', async (req, res) => {
            const quarry = {};
            const cursor = serviceCollection.find(quarry);
            const result = await cursor.toArray();
            res.send(result);
        });

        // loade singel data match by id

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const quarry = { _id: ObjectId(id) };
            const result = await serviceCollection.findOne(quarry);
            res.send(result);
        });

        // add data
        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });

        //  get orders service 
        app.get('/bookService', verifyToken, async (req, res) => {
            const headersEmail = req.decoded?.email;
            const email = req.query.email;
            if (headersEmail === email) {
                const query = { email };
                const cursor = orderServiceCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ massage: 'forbidden' })
            }
        })

        //  add orders service 
        app.post('/bookService', async (req, res) => {
            const bookService = req.body;
            const result = await orderServiceCollection.insertOne(bookService);
            res.send(result);
        })
    }
    finally {
    }
}
run().catch(console.dir)

app.get('/', async (req, res) => {
    res.send('done')
})



app.listen(port, () => {
    console.log('project is working');
})