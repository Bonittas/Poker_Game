# Poker Hand Evaluator API

A FastAPI backend to evaluate 5-card poker hands using `pokerkit` and store them in a PostgreSQL database.

## Features
- Evaluate a 5-card poker hand (`/evaluate`)
- List all evaluated hands (`/hands`)

## Setup

```bash
poetry install
poetry run uvicorn app.main:app --reload
