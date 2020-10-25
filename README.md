# Exponencial Concursos - Web Scraping

This is a simple example of Web Scraping.

This project do a web scraping in a website of questions to students.

## Getting started

### Prerequires

- [Puppeteer](https://github.com/puppeteer/puppeteer);
- [dotenv](https://github.com/motdotla/dotenv).
  - Install dotenv globally (```npm install -g dotenv```)

### Enviroment variables

The website requires authentication.

Before run the script, register on website and create a file named `.env`, on root folder, with your credentials of website.

The file should be like:

\# .env

```
EMAIL=your_email
PASSWORD=your_password
```

## Run script

To run project, execute ```node index.js``` on root folder.

The script will generate a JSON file on root folder with questions details.