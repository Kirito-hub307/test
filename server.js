const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // Для парсингу JSON-тіла запитів
app.use(express.static(path.join(__dirname, 'public'))); // Переконайтеся, що index.html у папці 'public'

// Дані про фільми (розширено до 8 фільмів з додатковими полями)
const movies = [
  {
    id: "1",
    title: "Фантастичний фільм: Початок",
    genre: "Фантастика, Пригоди",
    description: "Захоплива подорож у світ невідомих технологій та героїчних битв.",
    showtimes: ["12:30", "15:00", "17:30"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Фантастичний+фільм",
    price: 120
  },
  {
    id: "2",
    title: "Захисник: Битва за Місто",
    genre: "Бойовик, Супергерої",
    description: "Супергерой рятує місто від зловісних сил, використовуючи свої неймовірні здібності.",
    showtimes: ["13:45", "15:10", "18:00"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Супергеройський+бойовик",
    price: 130
  },
  {
    id: "3",
    title: "Пригоди Маленького Дракона",
    genre: "Мультфільм, Фентезі",
    description: "Весела історія про дружбу та пригоди маленького дракончика, що шукає своє місце у світі.",
    showtimes: ["11:00", "14:20", "16:50"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Мультфільм+для+дітей",
    price: 100
  },
  {
    id: "4",
    title: "Остання Надія: Історія Життя",
    genre: "Драма, Історія",
    description: "Глибока та зворушлива історія про випробування людського духу в складні часи.",
    showtimes: ["17:20", "18:40", "20:00"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Драма",
    price: 110
  },
  {
    id: "5",
    title: "Неймовірні Пригоди Туриста",
    genre: "Комедія",
    description: "Забавні ситуації, в які потрапляє звичайний турист, що шукає екзотики.",
    showtimes: ["14:00", "16:30", "19:00"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Комедія",
    price: 105
  },
  {
    id: "6",
    title: "Глибинний Страх",
    genre: "Трилер, Жахи",
    description: "Напружений трилер, що тримає в напрузі до останньої хвилини. Не для слабких духом.",
    showtimes: ["20:30", "22:00"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Трилер",
    price: 140
  },
  {
    id: "7",
    title: "Епоха Королів",
    genre: "Історія, Біографія",
    description: "Масштабний історичний фільм про життя великих монархів та долі імперій.",
    showtimes: ["10:00", "13:00", "16:00"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Історичний+фільм",
    price: 125
  },
  {
    id: "8",
    title: "Загублений Скарб",
    genre: "Пригоди, Фентезі",
    description: "Група відчайдушних шукачів вирушає на пошуки стародавнього скарбу, повного небезпек.",
    showtimes: ["11:30", "14:00", "16:30"],
    poster: "https://via.placeholder.com/180x250/333333/FFFFFF?text=Пригоди",
    price: 115
  }
];

// Тимчасове сховище для користувачів (для демонстрації)
const users = [];

// Роут для отримання всіх фільмів
app.get('/api/movies', (req, res) => {
  res.json(movies);
});

// Роут для пошуку фільмів
app.get('/api/movies/search', (req, res) => {
  const searchTerm = req.query.q ? req.query.q.toLowerCase() : '';
  if (!searchTerm) {
    return res.json(movies);
  }
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm) ||
    movie.genre.toLowerCase().includes(searchTerm) ||
    movie.description.toLowerCase().includes(searchTerm)
  );
  res.json(filteredMovies);
});

// Роут для отримання одного фільму за ID
app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ error: 'Фільм не знайдено' });
  }
});

// --- Роути для авторизації ---

app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Всі поля обов\'язкові!' });
  }

  if (users.some(u => u.username === username || u.email === email)) {
    return res.status(409).json({ message: 'Користувач з таким ім\'ям або Email вже існує.' });
  }

  const newUser = {
    id: (users.length + 1).toString(),
    username,
    password, // Увага: пароль НЕ хешується! Для прикладу.
    email,
    balance: 0,
    tickets: []
  };
  users.push(newUser);
  console.log('Registered user:', newUser);
  res.status(201).json({
    message: 'Реєстрація успішна!',
    user: { id: newUser.id, username: newUser.username, email: newUser.email, balance: newUser.balance }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Будь ласка, введіть логін та пароль.' });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.status(200).json({
      message: 'Вхід успішний!',
      user: { id: user.id, username: user.username, email: user.email, balance: user.balance }
    });
  } else {
    res.status(401).json({ message: 'Неправильний логін або пароль.' });
  }
});

// Middleware для перевірки авторизації
function authenticateUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  const user = users.find(u => u.id === userId);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: 'Неавторизований доступ. Будь ласка, увійдіть.' });
  }
}

// Роут для отримання даних про користувача
app.get('/api/profile', authenticateUser, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      balance: req.user.balance,
      tickets: req.user.tickets
    }
  });
});

// Роут для покупки квитка
app.post('/api/buy-ticket', authenticateUser, (req, res) => {
  const { movieId, showtime, quantity } = req.body;
  const user = req.user;
  const movie = movies.find(m => m.id === movieId);

  if (!movie || !showtime || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Некоректні дані для покупки квитка.' });
  }

  const totalCost = movie.price * quantity;

  if (user.balance < totalCost) {
    return res.status(400).json({ message: 'Недостатньо коштів на балансі.' });
  }

  user.balance -= totalCost;

  const newTicket = {
    ticketId: Date.now().toString(),
    movieId: movie.id,
    movieTitle: movie.title,
    showtime,
    date: new Date().toLocaleDateString('uk-UA'),
    quantity,
    totalCost
  };

  user.tickets.push(newTicket);

  res.status(200).json({
    message: 'Квитки успішно куплено!',
    newBalance: user.balance,
    newTicket
  });
});

// Роут для поповнення балансу
app.post('/api/topup-balance', authenticateUser, (req, res) => {
  const { amount } = req.body;
  const user = req.user;

  if (!amount || amount <= 0 || typeof amount !== 'number') {
    return res.status(400).json({ message: 'Некоректна сума поповнення.' });
  }

  user.balance += amount;
  res.status(200).json({ message: `Баланс успішно поповнено на ${amount} грн.`, newBalance: user.balance });
});

// Обслуговування index.html за замовчуванням
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
