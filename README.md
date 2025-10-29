# 🌍 Country Currency & Exchange API

A RESTful API that fetches and stores country data from an external source and enriches it with real-time currency exchange rates.  
Built with **Node.js**, **Express**, and **MySQL**, and deployed on **Railway**.

---

## 🚀 Features

- Fetches country data from [REST Countries API](https://restcountries.com)
- Fetches currency exchange rates from [ExchangeRate API](https://open.er-api.com/)
- Stores countries in a MySQL database
- Provides CRUD endpoints for managing countries
- Supports filtering and sorting by region, population, and name
- Automatically refreshes data from the external API
- Supports image caching and request timeouts

---

## 🧩 Tech Stack

- **Backend:** Node.js + Express  
- **Database:** MySQL (via Sequelize ORM)  
- **External APIs:**  
  - [REST Countries API](https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies)
  - [ExchangeRate API](https://open.er-api.com/v6/latest/USD)
- **Deployment:** [Railway](https://railway.app)

---

## 📦 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/country-currency-exchange-api.git
cd country-currency-exchange-api
```
