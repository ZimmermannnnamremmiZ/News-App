function customHttp() {
    return {
        get(url, cb) {
            fetch(url)
                .then(res => {
                    if (Math.floor(res.status / 100) !== 2) {
                        cb(`Error. Status code: ${res.status}`);
                        return;
                    } else {
                        return res.json()
                    }
                })
                .then(res => cb(null, res))
                .catch((error) => {
                    cb(error)
                })
        }
    };
}

// Init http module
const http = customHttp();

const newsService = (function () {
    const apiKey = "6396e3e8e4d41bea26c5b7af28fc67b0";
    const apiUrl = 'https://gnews.io/api/v4/';

    return {
        topHeadlines(country = "us", category = "technology", cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&topic=${category}&token=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/search?q=${query}&token=${apiKey}`, cb);
        }
    }
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['categories']

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
    const category = categorySelect.value;

    // если ничего не введено
    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
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
        // show empty message
        let toastHTML = '<span>Нет новостей в данной категории</span><button class="btn-flat toast-action">Close</button>';
        M.toast({
            html: toastHTML
        });
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

    // Именно insertAdjacentHTML, не insertAdjacentElement, так как нам надо вставить не DOM объект, а html строку
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

let img = "https://серебро.рф/img/placeholder.png"
// News item template function       news деструктурировали
function newsTemplate({
    image,
    title,
    url,
    description
}) {
    return `
        <div class="col s12">
            <div class="card">
                <div class="card-image">
                    <img class="card-image" src="${image || "https://серебро.рф/img/placeholder.png"}" onerror="this.src='https://серебро.рф/img/placeholder.png'">
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