require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to site
  await page.goto(
    "https://www.exponencialconcursos.com.br/questoes/main/resolver_questoes"
  );

  // Do login
  await page.evaluate(
    (email, password) => {
      let btn_login = document.querySelector('[data-target="#login-modal"]');
      btn_login.click();

      setTimeout(() => {
        let email_field = document.querySelectorAll(
          "#login-modal .row-login-a input"
        )[0];
        let password_field = document.querySelectorAll(
          "#login-modal .row-login-a input"
        )[1];
        let btn_submit_login = document.querySelector(
          "#login-modal .row-login-a #login-modal-entrar"
        );

        email_field.value = email;
        password_field.value = password;

        btn_submit_login.click();
      }, 1000);
    },
    process.env.EMAIL,
    process.env.PASSWORD
  );

  // Wait page reload
  await page.waitForSelector(".responder");

  // Scraping questions
  let questions = [];
  for (let q_count = 0; q_count < 10; q_count++) {
    let question = await page.evaluate(async () => {
      let q_info = document.querySelector(".questao-cabecalho .row .col-lg-8")
        .innerText;
      let q_statement = Array.from(
        document.querySelectorAll(".texto-questao:not(.questao-opcoes)")
      )
        .map((q) => q.innerText)
        .join("\n");
      let q_alternatives = Array.from(
        document.querySelectorAll("ul.questao-opcoes li")
      ).map((alternative) => {
        let content = alternative.querySelector("span.alternativa").innerText;
        return content.substr(content.indexOf(")") + 1, content.length);
      });
      let q_alternative_radio = document.querySelector(
        "ul.questao-opcoes li .radio input[type='radio']"
      );
      let btn_answer = document.querySelector(".responder");
      let right_answer = undefined;

      btn_answer.scrollIntoView({ behavior: "smooth" });

      q_alternative_radio.checked = true;

      btn_answer.click();

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          let answer_feedback = document.querySelector(".msg-resposta");

          if (answer_feedback.querySelector(".resposta-certa")) {
            right_answer = 0;
          } else {
            right_answer =
              answer_feedback
                .querySelector(".resposta-errada strong")
                .innerText.charCodeAt(0) - 97;
          }

          resolve();
        }, 2000);
      });

      return {
        info: q_info,
        statement: q_statement,
        alternatives: q_alternatives,
        right_answer,
      };
    });

    // Insert question scrapped to questions list
    questions.push(question);

    // Get URL for next question
    let next_question = await page.evaluate(async () => {
      return document.querySelector(".btn-aleatorio").href;
    });

    // Navigate to next question
    await page.goto(next_question);

    // Wait until show btn to answer
    await page.waitForSelector(".responder");
  }

  fs.writeFile("questions.json", JSON.stringify(questions, null, 2), (err) => {
    if (err) throw err;
  });

  await browser.close();
})();
