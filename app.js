const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => { 
    res.send('A simple Node App is '
        + 'running on this server') 
    res.end() 
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,console.log(`Server started on port ${PORT}`));