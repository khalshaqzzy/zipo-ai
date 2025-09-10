# Quiz API

This document details the API endpoints for creating, managing, and taking quizzes.

---

## Endpoints

### POST /api/quiz/generate

Generates a new quiz based on provided documents and instructions.

-   **Method:** `POST`
-   **URL:** `/api/quiz/generate`
-   **Authentication:** Required (Bearer Token)
-   **Body (JSON):**
    ```json
    {
      "fileIds": "string[]",
      "instructions": "string",
      "questionCount": "number"
    }
    ```
-   **Success Response:**
    -   **Code:** `201` Created
    -   **Content:**
        ```json
        {
          "message": "Quiz generated successfully",
          "quiz": { "_id": "string" }
        }
        ```

---

### GET /api/quiz/recent

Retrieves a summary of the user's most recent active and completed quizzes.

-   **Method:** `GET`
-   **URL:** `/api/quiz/recent`
-   **Authentication:** Required (Bearer Token)
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "active": "IQuizSummary[]",
          "completed": "IQuizSummary[]"
        }
        ```

---

### GET /api/quiz/:id

Retrieves the full data for a specific quiz.

-   **Method:** `GET`
-   **URL:** `/api/quiz/:id`
-   **Authentication:** Required (Bearer Token)
-   **URL Parameters:**
    -   `id` (string, required): The ID of the quiz.
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:** `IQuiz`

---

### POST /api/quiz/:id/save-progress

Saves the user's current answers and time left for an active quiz.

-   **Method:** `POST`
-   **URL:** `/api/quiz/:id/save-progress`
-   **Authentication:** Required (Bearer Token)
-   **Body (JSON):**
    ```json
    {
      "answers": "object",
      "timeLeft": "number"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK

---

### POST /api/quiz/:id/submit

Submits the quiz, calculates the final score, and marks it as completed.

-   **Method:** `POST`
-   **URL:** `/api/quiz/:id/submit`
-   **Authentication:** Required (Bearer Token)
-   **Body (JSON):**
    ```json
    {
      "answers": "object"
    }
    ```
-   **Success Response:**
    -   **Code:** `200` OK
    -   **Content:**
        ```json
        {
          "message": "Quiz submitted successfully",
          "score": "number"
        }
        ```
