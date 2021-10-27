import {Request, Response, Router} from 'express';
import Controller from "./BinanceController";

class EntityController {

    private request = require('request');
    private crypto = require('crypto');

    private router = Router();

    private BINANCE_KEY = process.env.BINANCE_KEY;
    private BINANCE_SECRET = process.env.BINANCE_SECRET;
    private BINANCE_URL = process.env.BINANCE_URL;
    private FIAT_SYMBOLS = process.env.FIAT_SYMBOLS.split(",");


    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post(`/binance`, this.event)
    }

    event = async (req: Request, res: Response, next) => {
        try {

            console.log("Client request:",req.body);
            
            const pair = req.body['asset'].toUpperCase();
            const order = req.body['order'].toUpperCase();
            const strategy = req.body['strategy'];
            const tradePercent = req.body['tradePercent'];

            const date = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Madrid'
            };
            const spainDate = date.toLocaleDateString('es-ES', options);

            console.log("Resume:",{
                time: spainDate,
                asset: pair,
                order: order,
                strategy
            })

            new Promise(async () => {
                switch (order) {
                    case "BUY": {
                        await this.buyAsset(pair, tradePercent);
                        break;
                    }
                    case "SELL":
                    case "STOP": {
                        await this.sellAsset(pair);
                        break;
                    }
                }
            })
            res.json({status: 'ok'})
            next();
        } catch (e) {
            next(e);
        }
    }

    private async buyAsset(pair, tradePercent) {
        const fiatBalance = await this.getFiatBalance(pair);
        const assetPrice = await this.price(pair);
        const quantityToBuy = (fiatBalance * tradePercent) / assetPrice;
        await this.order(pair, 'BUY', quantityToBuy);
    }

    private async getFiatBalance(pair) {
        for (let fiatSymbol of this.FIAT_SYMBOLS) {
            if (pair.includes(fiatSymbol)) return this.getBalance(fiatSymbol);
        }
        throw new Error("not supported FIAT symbol");
    }

    private getSymbol(pair) {
        let symbol = pair;
        for (let fiatSymbol of this.FIAT_SYMBOLS) {
            symbol = symbol.replace(fiatSymbol, '');
        }
        if (symbol == pair) throw new Error("not supported FIAT symbol");
        return symbol;
    }

    private async sellAsset(pair) {
        const symbol = this.getSymbol(pair);
        const balance = await this.getBalance(symbol);
        await this.order(pair, 'SELL', balance);
    }

    private static truncateDecimals(num, digits) {
        const numS = num.toString(),
            decPos = numS.indexOf('.'),
            substrLength = decPos == -1 ? numS.length : 1 + decPos + digits,
            trimmedResult = numS.substr(0, substrLength),
            finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;
        return parseFloat(finalResult);
    }

    private async getBalance(symbol) {
        const balances = await this.getAccountBalances();
        for (let balance of balances) {
            if (balance['asset'] == symbol) return balance['free'];
        }
        return 0;
    }

    private async order(pair, side, quantity) {
        let completed = false;
        do {

            const precision = await this.precision(pair);
            const truncatedQuantity = Controller.truncateDecimals(quantity, precision);
            const price = await this.price(pair);
            const requestResponse = await this.httpRequest('POST', `${this.BINANCE_URL}/api/v3/order?symbol=${pair}&side=${side}&quantity=${truncatedQuantity}&type=LIMIT&price=${price}&timeInForce=GTC`, true);

            // comprobaciones de errores
            let error = false;

            // si ha fallado la precisión del lote lo reduce en 1 y lo guarda para la siguiente
            const requestResponseMessage = requestResponse['msg'];
            if (requestResponseMessage != null && requestResponseMessage == 'Filter failure: LOT_SIZE') {
                error = true;
                this.exchangePrecisionSymbols[pair] = precision - 1;
            }

            // si no hay errores la marca como completada
            completed = !error;
        } while (!completed);
    }

    private async price(pair) {
        return (await this.httpRequest('GET', `${this.BINANCE_URL}/api/v3/ticker/price?symbol=${pair}`, false))['price'];
    }

    private exchangePrecisionSymbols = null;

    private async precision(pair) {

        // solo guarda la información del exchange una vez
        if (this.exchangePrecisionSymbols == null) {
            this.exchangePrecisionSymbols = {};

            const exchangeSymbols = (await this.httpRequest('GET', `${this.BINANCE_URL}/api/v3/exchangeInfo`, false))['symbols'];
            for (let symbol of exchangeSymbols) {
                const symbolName = symbol.symbol;
                const symbolPrecision = symbol.quotePrecision;
                this.exchangePrecisionSymbols[symbolName] = symbolPrecision;
            }
        }

        const pairPrecision = this.exchangePrecisionSymbols[pair];
        return (pairPrecision != null) ? pairPrecision : 8;
    }

    private async getAccountBalances() {
        return (await this.httpRequest('GET', `${this.BINANCE_URL}/api/v3/account`, true))['balances'];
    }


    private async httpRequest(method, url, signed) {

        // si la petición tiene que ir firmada añade el timestamp y la firma
        if (signed) {
            if (!url.includes('?')) url = `${url}?`;
            url = `${url}&timestamp=${new Date().getTime()}`;
            let query = url.split('?')[1];
            query = query != null ? query : '';
            url = `${url}&signature=${this.signature(query)}`;
        }

        const options = {
            'method': method,
            'url': url,
            'headers': {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': this.BINANCE_KEY
            }
        };

        return JSON.parse(await new Promise((resolve, reject) => {
            this.request(options, function (error, response) {
                if (error) reject(error);
                resolve(response.body);
            });
        }));
    }

    private signature(query) {
        return this.crypto
            .createHmac('sha256', this.BINANCE_SECRET)
            .update(query)
            .digest('hex');
    }
}

export default EntityController
