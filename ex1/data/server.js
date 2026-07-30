const http = require("http");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "books.json");

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "application/json");

    // GET /books
    if (req.method === "GET" && req.url === "/books") {

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ message: "Error reading file" }));
            }

            res.statusCode = 200;
            res.end(data);
        });

    }

    // POST /books
    else if (req.method === "POST" && req.url === "/books") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            try {

                const newBook = JSON.parse(body);

                fs.readFile(filePath, "utf8", (err, data) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({ message: "Error reading file" }));
                    }

                    const books = JSON.parse(data);

                    newBook.id =
                        books.length > 0
                            ? books[books.length - 1].id + 1
                            : 1;

                    books.push(newBook);

                    fs.writeFile(
                        filePath,
                        JSON.stringify(books, null, 2),
                        (err) => {

                            if (err) {
                                res.statusCode = 500;
                                return res.end(JSON.stringify({ message: "Error writing file" }));
                            }

                            res.statusCode = 201;
                            res.end(JSON.stringify(newBook));

                        }
                    );

                });

            } catch {

                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON" }));

            }

        });

    }

    // DELETE /books/:id
    else if (req.method === "DELETE" && req.url.startsWith("/books/")) {

        const id = parseInt(req.url.split("/")[2]);

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ message: "Error reading file" }));
            }

            let books = JSON.parse(data);

            const index = books.findIndex(book => book.id === id);

            if (index === -1) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ message: "Book not found" }));
            }

            books.splice(index, 1);

            fs.writeFile(
                filePath,
                JSON.stringify(books, null, 2),
                (err) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({ message: "Error writing file" }));
                    }

                    res.statusCode = 200;
                    res.end(JSON.stringify({ message: "Book deleted successfully" }));

                }
            );

        });

    }

    // Invalid Route
    else {

        res.statusCode = 404;
        res.end(JSON.stringify({ message: "Route not found" }));

    }

});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});