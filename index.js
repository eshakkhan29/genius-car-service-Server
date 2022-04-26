const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.grvhn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('Car-Service').collection('service');

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