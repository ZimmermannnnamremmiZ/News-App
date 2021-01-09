function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}

// Init http module
const http = customHttp();

const newsService = (function () {
    const apiKey = "e721719ee2cc467c95b6719dfa8a87a1";
    const apiUrl = 'https://news-api-v2.herokuapp.com';

    return {
        topHeadlines(country = "us", cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
        }
    }
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
})

// init selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
});

// load news function
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;

    // если ничего не введено
    if (!searchText) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
}


// Function on get responce from server  (функция, которая будет должна отработать после получения новостей)

function onGetResponse(err, res) {
    removePreloader()

    if (err) {
        showAlert(err, 'error-msg');
        return;
    };

    if (!res.articles.length) {
        // show wmpty message
        return;
    }
    renderNews(res.articles);
}

// Function render news
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row')
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }
    let fragment = "";
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });

    // Именно insertAdjacentHTML, не insertAdjacentElement, так как наам надо вставить не DOM объект, а html строку
    newsContainer.insertAdjacentHTML('afterbegin', fragment)
}

// Function clear container (либо в innerHTML записать пустую строку (container.innerHTML = '';), либо пройтись циклом по всем дочерним элементам и удалить их по одному)
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

// News item template function       news деструктурировали
function newsTemplate({
    urlToImage,
    title,
    url,
    description
}) {
    return `
        <div class="col s12">
            <div class="card">
                <div class="card-image">
                    <img src="${urlToImage}">
                    <span class="card-title">${title || ""}</span>
                </div>
                <div class="card-content">
                    <p>${description || ""}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read more</a>
                </div>
            </div>
        </div>
        `;
}

document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
});

// toast Materialize (создали функцию обертку)
function showAlert(msg, type = "success") {
    // M это глобальный объект материалайза в JS
    M.toast({
        html: msg,
        classes: type
    });
}


// Show loader function (Material -> components -> preloader)
function showLoader() {
    document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress">
        <div class="indeterminate"></div>
    </div>
    `)
}

// Remove loader function
function removePreloader() {
    const loader = document.querySelector('.progress')
    if (loader) {
        loader.remove();
    }
}