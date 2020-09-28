const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;

const uri = "mongodb+srv://myDbUser:93aGyGsmewznQIfO@cluster0.efifc.mongodb.net/organicdb?retryWrites=true&w=majority";
const client = new MongoClient(
    uri,
    { useUnifiedTopology: true },
    { useNewUrlParser: true } 
);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


client.connect(err => {
    const productCollection = client.db("organicdb").collection("products");

    app.get('/products', (req, res) => {
        productCollection.find({}).limit(10)
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/product/:id', (req, res) => {
        productCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    app.post('/addProduct', (req, res) => {
        const product = req.body;
        productCollection.insertOne(product)
            .then(result => {
                // console.log('added')
                res.redirect('/')
            });
    })

    app.delete('/delete/:id', (req, res) => {
        // console.log(req.params.id)
        productCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    app.patch('/update/:id', (req, res) => {
        // console.log(req.body.name)
        productCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: {
                    name: req.body.name,
                    price: req.body.price,
                    quantity: req.body.quantity
                }
            }
        )
        .then(result => {
            res.send(result.modifiedCount > 0);
        })
    })

    // client.close();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.listen(5000, () => console.log('Listening to port 5000'));