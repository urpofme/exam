/* eslint-disable no-use-before-define */
'use-strict';

let perPage = 5;
let selectedRoute;
let selectedGuide;
let pullGuides;

function getUr(path) {
    // eslint-disable-next-line max-len
    let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${path}`);
    url.searchParams.set("api_key", "3a18ad76-78d5-4602-b173-033eaf0c167c");
    return url;
}

//очистка выбора
function tableset0(name) {
    let table = document.getElementById(name);
    for (let row of table.children) {
        row.classList.remove('table-secondary');
    }
}

//выбор языка в разделе гидов
function guideLanguage() {
    const items = JSON.parse(sessionStorage.getItem('guides'));
    const select = document.getElementById('languages');
    select.innerHTML = '';

    const someLang = ['Язык', ...new Set(items.map(item => item.language))];

    someLang.forEach(language => {
        const optionLang = new Option(language, language);
        select.appendChild(optionLang);
    });
}

//получние гида по выбранному маршруту
function guideRecep() {
    let items = pullGuides;
    if (items == undefined || items.length == 0) {
        items = JSON.parse(sessionStorage.getItem('guides'));
    }
    return items;
}

//обработка кнопки выбрать в маршрутах
async function routeChoose(item, tableRow) {
    selectedRoute = item;
    tableset0('routeTableBody');
    tableRow.classList.add('table-secondary');
    let header = document.querySelector('.guide-route');
    header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
    await guideRecepes(item.id);
    pullGuides = [];
    // eslint-disable-next-line no-use-before-define
    guideDisp();
    guideLanguage(); // Вызов функции guideLanguage()
    showOrder();
}

//обработка нажатия кнопки выбора гида
function guideC(item, tableRow) {
    selectedGuide = item;
    tableset0('guideTable');
    tableRow.classList.add('table-secondary');
    showOrder();
}

//отображение спика гидов
function guideDisp() {
    let table = document.getElementById('guideTable');
    let items = guideRecep();
    table.innerHTML = '';

    for (let i = 0; i < items.length; i++) {
        let tr = document.createElement('tr');
        if (selectedGuide && items[i].id === selectedGuide.id) {
            tr.classList.add('table-secondary');
        }

        let th = document.createElement('th');
        let i2 = document.createElement('i');
        i2.classList.add('bi', 'bi-person-circle');
        th.appendChild(i2);
        tr.appendChild(th);

        let name = document.createElement('td');
        name.textContent = items[i].name;
        tr.appendChild(name);

        let language = document.createElement('td');
        language.textContent = items[i].language;
        tr.appendChild(language);

        let workExperience = document.createElement('td');
        workExperience.textContent = items[i].workExperience;
        tr.appendChild(workExperience);

        let price = document.createElement('td');
        price.textContent = items[i].pricePerHour + ' руб/час';
        tr.appendChild(price);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.textContent = 'Выбрать';
        button.classList.add('btn', 'primary', 'text-black');
        button.addEventListener('click', () => {
            guideC(items[i], tr);
        });
        buttonTd.appendChild(button);
        tr.appendChild(buttonTd);

        table.appendChild(tr);
    }
}

//отображение доступных гидов по выбранному маршруту
async function guideRecepes(id) {
    let response = await fetch(getUr(`routes/${id}/guides`));
    let items = await response.json();
    sessionStorage.setItem('guides', JSON.stringify(items));
}

function listC(name, value, active) {
    const li = document.createElement('li');
    li.classList.add('page-item');

    const link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link', 'link');
    link.addEventListener('click', () => {
        showRoutes(value);
    });

    li.appendChild(link);

    if (active) {
        link.classList.add('text-balck', 'primary');
    }

    return li;
}

//получение списка из хр
function savedRoutes() {
    const object = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (object == undefined) {
        object = JSON.parse(sessionStorage.getItem('routes'));
    }
    return object;
}

//отображение маршрутов
function showRoutes(page) {
    let table = document.getElementById('routeTableBody');
    let items = savedRoutes();
    showPag(page);
    table.innerHTML = '';

    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        let tr = document.createElement('tr');
        if (selectedRoute !== undefined && items[i].id === selectedRoute.id) {
            tr.classList.add('table-secondary');
        }
        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let descr = document.createElement('td');
        descr.innerHTML = items[i].description;
        tr.append(descr);

        let obj = document.createElement('td');
        obj.innerHTML = items[i].mainObject;
        tr.append(obj);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn', 'primary', 'text-black');
        button.addEventListener('click', () => {
            routeChoose(items[i], tr);
        });
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

//список маршрутов
function setedRoute() {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let select = document.getElementById('objects');
    select.innerHTML = '';

    let uniqueObjects = ['Маршруты', ...new Set(items.map(item => item.mainObject))];

    // Создаем элементы option и добавляем их в select
    uniqueObjects.forEach(obj => {
        let option = new Option(obj, obj);
        select.appendChild(option);
    });
}

//поиск маршрутов
function findRoute(form) {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let search = form.elements['search'].value.trim();
    let select = form.elements['objects'].value;

    // Фильтрация маршрутов по строке поиска
    let searched = items.filter(item => search && search !== '' ? item.name.includes(search) : true);

    // Если выбран объект, фильтруем маршруты по нему
    if (select !== 'Маршруты') {
        searched = searched.filter(item => item.mainObject.includes(select));
    }

    // Сохраняем отфильтрованные маршруты в sessionStorage
    sessionStorage.setItem('searched-routes', JSON.stringify(searched));

    // Показываем результаты поиска
    showRoutes(1);
}

//гид форма
function findGuide(form) {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let languages = form.elements['languages'].value;
    let from = +form.elements['xpFrom'].value;
    let to = +form.elements['xpTo'].value;
    let searched = [];
    if (languages === 'Язык') {
        searched = [...items];
    } else {
        searched = items.filter(item => item.language.includes(languages));
    }
    if (from >= to) {
        // eslint-disable-next-line max-len
        dispErr(document.querySelector('.guide-error-block'), 'Выберите корректный стаж работы');
    } else {
        // eslint-disable-next-line max-len
        searched = searched.filter(item => item.workExperience >= from && item.workExperience <= to);
    }
    pullGuides = searched;
    if (searched.length === 0) {
        // eslint-disable-next-line max-len
        dispErr(document.querySelector('.guide-error-block'), 'Подходящие гиды не найдены, выведены доступные гиды');
    }
    guideDisp();
}

//получение списка маршрутов
async function getRoute() {
    try {
        let response = await fetch(getUr('routes'));
        let items = await response.json();
        let route = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            mainObject: item.mainObject
        }));
        sessionStorage.setItem('routes', JSON.stringify(route));
        showRoutes(1);
    } catch (error) {
        console.error('Err:', error);
    }
}

//пагинация
function showPag(page) {
    const pages = document.querySelector('.pagination');
    pages.innerHTML = '';

    const items = savedRoutes();
    const start = Math.max(page - 2, 1);
    const last = Math.ceil(items.length / perPage);
    const end = Math.min(page + 2, last);

    // Создание ссылок для первой страницы и последней страницы
    pages.append(listC('Первая страница', 1));
    // Отображение ссылок на предыдущие страницы
    for (let i = start; i <= end; i++) {
        pages.append(listC(i, i, page === i));
    }
    // Создание ссылки для последней страницы
    pages.append(listC('Последняя страница', last));
}

window.onload = () => {
    initializePage();

    const routesForm = document.getElementById('routes-form');
    routesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        findRoute(routesForm);
    });

    const select = document.getElementById('objects');
    select.addEventListener('change', () => {
        findRoute(routesForm);
    });

    const guideForm = document.getElementById('guide-form');
    guideForm.addEventListener('submit', (event) => {
        event.preventDefault();
        findGuide(guideForm);
    });

    document.getElementById('orderModal').addEventListener('show.bs.modal', handleOrderModal);
};

async function initializePage() {
    await getRoute();
    setedRoute();
}

function handleOrderModal(event) {
    const modal = event.target;
    modal.querySelector('#fullname').innerHTML = selectedGuide.name || '';
    modal.querySelector('#route-name').innerHTML = selectedRoute.name || '';
    modal.querySelector('#time').value = '00:00';
    modal.querySelector('#date').value = new Date().toISOString().split('T')[0];

    const formUpdEvent = { target: modal };
    modal.querySelector('#duration').addEventListener('change', () => formUpd(formUpdEvent));
    modal.querySelector('#count').addEventListener('input', () => formUpd(formUpdEvent));
    modal.querySelector('#time').addEventListener('change', () => formUpd(formUpdEvent));
    modal.querySelector('#date').addEventListener('change', () => formUpd(formUpdEvent));
}
