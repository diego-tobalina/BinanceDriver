# [🔥 UPDATE V1] BinanceDriver

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=xBidi_BinanceDriver&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=xBidi_BinanceDriver)
[![CircleCI](https://circleci.com/gh/circleci/circleci-docs.svg?style=shield)](https://circleci.com/gh/xBidi/BinanceDriver)

Aplicación que permite interactuar con la API de Binance de una forma más sencilla

## 💡 Cómo utilizar la aplicación

```
    1. Renombrar **.env.example** a **.env** `mv .env.example .env`
    2. Modificar las variables de **.env**
    3. Instalar las dependencias `npm i`
    4. Lanzar la aplicación `npm run start` (para desarrollo utilizar `npm run dev`)
```

## 🛒 Peticiones de ejemplo

### Compra

Comprará BTC por el valor de 0.01% del USDT disponible en la cuenta de spot

```
curl --location --request POST 'https://localhost/api/v0/binance' \
--header 'Content-Type: application/json' \
--data-raw '{
  "order": "BUY",
  "asset": "BTCUSDT",
  "token": "6116714f-fe3e-43be-a194-f453fbf51c71",
  "tradePercent": "0.01"
}'
```

### Venta

Venderá todo el BTC que tiene disponible en la cuenta de spot a la moneda USDT

```
curl --location --request POST 'https://localhost/api/v0/binance' \
--header 'Content-Type: application/json' \
--data-raw '{
  "order": "SELL",
  "asset": "BTCUSDT",
  "token": "6116714f-fe3e-43be-a194-f453fbf51c71"
}'
```

## 🚀 Desplegar en heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/xBidi/BinanceDriver)

### ⚠️ Beware of forks. I do not give any guarantee that the fork may turn out to be a scam.

### 💥 Disclaimer

All investment strategies and investments involve risk of loss.
**Nothing contained in this program, scripts, code or repository should be construed as investment advice.**
Any reference to an investment's past or potential performance is not, and should not be construed as, a recommendation
or as a guarantee of any specific outcome or profit. By using this program you accept all liabilities, and that no
claims can be made against the developers or others connected with the program.

