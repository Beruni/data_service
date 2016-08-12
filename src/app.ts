import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import * as mongoose from 'mongoose';
import * as gridfs from 'gridfs-stream';
import * as fs from 'fs';
import {DataFile} from "./models";
import {AuthenticationService} from './middleware';
import * as JSONStream from "JSONStream";
import { decode } from "jsonwebtoken";

var app = express();

app.set('port', process.env.PORT || '3002');
app.set('mongo_host', process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost');

app.use(bodyParser.json());


app.use((req:express.Request, res:express.Response, next:express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, authorization");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'authorization');
    next();
});

// var serviceDiscovery = new middleware.NodeDiscoveryService();
// app.use(function(req, res, next) {
//     serviceDiscovery.fetchNodeServers(res, next);
// });
//
//
app.use(function(req, res, next) {
    if (req.method == 'OPTIONS') {
        next()
    } else {
        new AuthenticationService(req).authenticate(res, next);
    }
});

var uploadConfig = multer({dest: "./uploads"});

app.post("/upload", uploadConfig.single('dataFile'), (req:express.Request, res:express.Response) => {
    var user = decode(req.headers['authorization']);
    var gfs = gridfs(mongoose.connection.db, mongoose.mongo);
    var writeStream = gfs.createWriteStream();

    var readStream = fs.createReadStream(req.file.path).pipe(JSONStream.parse(""));
    readStream.on("close", ()=> {
        fs.createReadStream(req.file.path).pipe(writeStream);
    });

    readStream.on("error", e => res.status(406).send("Invalid JSON!"));

    writeStream.on('close', file => {
        var tags = req.body.tags.split(",");
        new DataFile().save(user['id'],req.body.title, tags, file._id)
            .then(dataFileId => res.status(200).send({fileId: dataFileId}));

    });

    writeStream.on('error', e => res.status(500).send("Could not upload file"));

});

app.get("/fetchFiles", function(request, response){
    var user = decode(request.headers['authorization']);
    new DataFile().fetch(user.id,(files) => {
        response.end(JSON.stringify(files));
    });
});

app.get('/ping',function (req,res) {
    res.end("pong")
});
mongoose.connect('mongodb://' + app.get('mongo_host') + '/beruni_data_files');

app.listen(app.get('port'));