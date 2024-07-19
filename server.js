const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const port = process.env.PORT || 5000;
app.use(express.json());
const dbConnect = require('./dbConnect');
const userRoute = require('./routers/userRoute');
const transactionRoute = require('./routers/transactionRoute');
const budgetRoute = require('./routers/budgetRoute');
const planRoute = require('./routers/planRoute');
const goalRoute = require('./routers/goalRoute');

app.use('/api/users/', userRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/budgets', budgetRoute);
app.use('/api/plans', planRoute);
app.use('/api/goals', goalRoute)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static('client/build'));

    app.get('*', (res, req)=>{
      res.sendFile(path.resolve(__dirname, 'client/build/index.html'))
    })
}

app.listen(port, () => console.log(`Node js started at port ${port}!`));