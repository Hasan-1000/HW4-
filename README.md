[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/51952861-283ceef5-9f73-4dc1-b683-4c9e97109b5d?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D51952861-283ceef5-9f73-4dc1-b683-4c9e97109b5d%26entityType%3Dcollection%26workspaceId%3Dc3ce1c81-1637-4bce-b4e3-bd28c1aa7fb4)



# Movie Reviews API (Assignment 4)

## Project Explanation
This project is a Movie Reviews API built using Node.js, Express, and MongoDB.

The API allows users to:
- View all movies
- View a specific movie
- Add reviews for movies (JWT protected)
- Retrieve a movie along with its reviews using the query parameter `?reviews=true`

The project demonstrates database relationships by storing reviews in a separate collection and linking them to movies using `movieId`. MongoDB aggregation with `$lookup` is used to return movie details along with reviews.

---

## Installation and Usage Instructions

1. Clone the repository:
2. Install dependencies:
3. Create a `.env` file in the root directory and add: the.env files
4. Start the server: (using npm start in the terminal)
5. You can either open in browser or in postman.




---

## Postman Test Collection

The Postman collection includes tests for:
- User signup
- User login (JWT automatically saved)
- Get all movies
- Get valid movie
- Get invalid movie
- Get movie with reviews (`?reviews=true`)
- Valid save review
- Invalid save review

## Environment Settings

The following environment variables are required:

- `SECRET_KEY`: Used for JWT authentication
- `DB`: MongoDB connection string
- `PORT`: Server port (default 8080)