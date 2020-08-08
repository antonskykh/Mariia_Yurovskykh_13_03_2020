let moviesData;
const genreSelect = document.querySelector('.genre-select');

fetch('http://my-json-server.typicode.com/moviedb-tech/movies/list')
  .then(response => response.json())
  .then(movies => {
    renderGenres(movies);
    prepareData(movies);
    renderUI();
  });

function renderGenres(movies) {
  const genres = new Set;
  movies.forEach((movie) => {
    movie.genres.forEach((genre) => {
      genres.add(genre.toLowerCase());
    });
  });
  genres.forEach((genre) => {
    genreSelect.innerHTML += `<option value='${genre}'>${genre}</option>`;
  });
};

function prepareData(movies) {
  if (!localStorage.getItem('movies')) {
    movies.forEach((movie) => {
      movie.isFavorite = false;
    });
    setMoviesData(movies);
  };
}

function setMoviesData(movies) {
  localStorage.setItem('movies', JSON.stringify(movies));
}

function renderUI() {
  moviesData = JSON.parse(localStorage.getItem('movies'));
  renderGrid();
  renderFavs();
}

function renderGrid() {
  const cardsWrapper = document.createElement('div');
  cardsWrapper.classList.add('cards-wrapper');
  moviesData.forEach((movie) => {
    const buttonClass = movie.isFavorite ? 'favorite-star is-favorite' : 'favorite-star';
    const movieCard = document.createElement('div');
    const genres = movie.genres.join(', ').toLowerCase();
    movieCard.classList.add('movie-card');
    movieCard.dataset.genres = genres;
    movieCard.dataset.id = movie.id;
    movieCard.innerHTML = `
      <div class='poster-wrapper'><img src=${movie.img} alt='${movie.name}' class='movie-poster'></div>
      <button data-id=${movie.id} class='${buttonClass}'>★</button>
      <div class='content-wrapper'>
        <p class='movie-name'>${movie.name}</p>
        <p class='movie-year'>${movie.year}</p>
        <p class='movie-description'>${movie.description}</p>
        <div class='movie-genres'>${genres}</div>
      </div>
    `;

    const favButton = movieCard.querySelector('button');
    makeFavorite(favButton)

    movieCard.addEventListener('click', (event) => {
      renderModal(event);
    });
    cardsWrapper.appendChild(movieCard);
  });

  const main = document.querySelector('main');
  main.appendChild(cardsWrapper);
}

function renderFavs() {
  const aside = document.querySelector('aside');
  let favsWrapper = document.querySelector('.favs-wrapper');

  if (!favsWrapper) {
    const favsWrapper = document.createElement('ul');
    favsWrapper.classList.add('favs-wrapper');
    aside.appendChild(favsWrapper);
  } else {
    favsWrapper.innerHTML = '';
  }

  moviesData.forEach((movie) => {
    if (movie.isFavorite) {
      const favName = document.createElement('li');
      favName.innerHTML = `${movie.name} <button data-id=${movie.id} class='remove-favorite'>×</button>`;

      const removeFavButton = favName.querySelector('button');
      removeFavButton.addEventListener('click', (event) => {
        moviesData.forEach((movie) => {
          if (movie.id === +event.target.dataset.id) {
            movie.isFavorite = !movie.isFavorite;
            const starOnCard = document.querySelector(`.movie-card [data-id='${event.target.dataset.id}']`);
            starOnCard.classList.remove('is-favorite');
          }
        });
        localStorage.setItem('movies', JSON.stringify(moviesData));
        moviesData = JSON.parse(localStorage.getItem('movies'));
        renderFavs();
      });

      favsWrapper = document.querySelector('.favs-wrapper');
      favsWrapper.appendChild(favName);
    }
  });
}

function renderModal(event) {
  let modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modal-background');
  const targetParent = event.target.closest('.movie-card');

  if (event.target.className !== 'favorite-star' && event.target.className !== 'favorite-star is-favorite') {
    moviesData.forEach((movie) => {
      if (movie.id === +targetParent.dataset.id) {
        const buttonClass = movie.isFavorite ? 'favorite-star is-favorite' : 'favorite-star';
        modalWrapper.innerHTML = `
          <div class='modal-wrapper'>
            <div class='left-side-popup'>
            <div class='poster-wrapper'><img src=${movie.img} alt='${movie.name}' class='movie-poster'></div>
              <br>
              <button data-id=${movie.id} class='${buttonClass}'>★</button>
              <p class='movie-year'>${movie.year}</p>
              <div class='movie-genres'>${movie.genres.join(', ').toLowerCase()}</div>
            </div>
            <div class='right-side-popup'>
              <p class='movie-name'>${movie.name}</p>
              <p class='movie-description'>${movie.description}</p>
              <p class='movie-director'>Director: ${movie.director}</p>
              <p class='movie-starring'>Starring: ${movie.starring.join(', ')}</p>
            </div>
            <button class='close-popup'>×</button>
          </div>
        `;

        const favButton = modalWrapper.querySelector('.favorite-star');
        makeFavorite(favButton);

        const closeButton = modalWrapper.querySelector('.close-popup');
        closeButton.addEventListener('click', () => {
          if (document.querySelector('.modal-wrapper')) {
            modalWrapper.remove();
            modalWrapper = null;
            document.body.classList.remove('hide-overflow');
          }
        });

        document.body.classList.add('hide-overflow');
        document.body.appendChild(modalWrapper);
      }
    });
  }
}

function makeFavorite(button) {
  button.addEventListener('click', (event) => {
    moviesData.forEach((movie) => {
      if (movie.id === +event.target.dataset.id) {
        movie.isFavorite = !movie.isFavorite;
        event.target.classList.toggle('is-favorite');
      }
    });
    localStorage.setItem('movies', JSON.stringify(moviesData));
    renderFavs();
  });
}

genreSelect.addEventListener('change', (event) => {
  const movieCards = document.querySelectorAll('.movie-card');
  movieCards.forEach((card) => {
    card.classList.remove('hide');
    if (event.target.value === 'all') {
      card.classList.remove('hide');
    } else if (!card.dataset.genres.includes(event.target.value)) {
      card.classList.add('hide');
    }
  });
});
