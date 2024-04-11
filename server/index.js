const express = require("express")
const bodyParser = require('body-parser');
const cors = require("cors");
const { stringify } = require("querystring");

const PORT = process.env.PORT || 3001;

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(bodyParser.json());

app.post("/api/process-file", (req, res) => {
    let fileContent = req.body.data;
    console.log(fileContent)

    let userMap = new Map();

    while (true) {
        let symbol1 = fileContent.search("<")
        let symbol2 = fileContent.search(">")

        let userName = fileContent.substring(symbol1 + 1, symbol2)
        fileContent = fileContent.substring(symbol2 + 1)

        let nexSym1 = fileContent.search("<")
        if (nexSym1 < 0) {
            break;
        }
        let userWord = fileContent.substring(0, nexSym1)

        let wordCount = userWord.trim().split(/\s+/).length;

        if (!userMap.get(userName)) {
            userMap.set(userName, wordCount)
        } else {
            let currentWordCount = userMap.get(userName)
            userMap.set(userName, currentWordCount + wordCount)
        }

        console.log("Username: ", userName)
        console.log("Filecontent: ", fileContent)
        console.log("Userword: ", userWord)

        console.log(userMap)
    }

    const sortedMap = new Map([...userMap.entries()].sort((a, b) => b[1] - a[1]));

    const sortedObject = Object.fromEntries(sortedMap);

    res.json(sortedObject);
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
})