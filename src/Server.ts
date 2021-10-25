import BinanceController from "./app/BinanceController";
import App from './App'
import * as bodyParser from 'body-parser'
import validateToken from "./app/TokenValidatorMiddleware";

require('dotenv').config();

const app = new App({
    port: +process.env.PORT || 8080,
    controllers: [
        new BinanceController(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({extended: true}),
        validateToken,
    ]
})

app.listen();
