let app = {
    pages: [],
    profiles: [],
    savedProfiles: [],
    profileKey: 'saveProfile',
    imgURL: "",

    init: () => {

        document.addEventListener('deviceready', app.ready);
    },

    ready: () => {

        app.getTundraAPI();
        app.pages = document.querySelectorAll('.page');
        app.pages[0].classList.add('active');
    },

    /******************************************
                FETCH TUNDRA API
    ******************************************/

    getTundraAPI: () => {
        let url = 'http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=';

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                app.profiles = data.profiles;
                // console.log(data);
                let encoded = data.imgBaseURL;
                // console.log('This is encoded imgBaseURL:', encoded);
                app.imgURL = decodeURIComponent(encoded);
                // console.log('This is decoded imgBaseURL:', app.imgURL);
            })
            .then(() => {
                app.createCards();
                app.AddListeners();
            })
            .catch((err) => {
                console.log('Fetch Error', err.message);
            });
    },

    /******************************************
                CLICK LISTENERS
    ******************************************/

    AddListeners: () => {
        document.querySelector('.home').addEventListener('click', app.goHomePage);
        document.querySelector('.fav').addEventListener('click', app.goSavedPage);

        let target = document.querySelectorAll('.card');
        // console.log('Swipe Target',target);
        target.forEach((card) => {
            let targetTinyShell = new tinyshell(card);
            // console.log(card);
            targetTinyShell.addEventListener('swipeleft', app.swipeLeft);
            targetTinyShell.addEventListener('swiperight', app.swipeRight);
        })
    },

    /******************************************
                         SPA
    ******************************************/

    goSavedPage: () => {
        app.pages[1].classList.add('active');
        app.pages[0].classList.remove('active');
        let home = document.querySelector('.home');
        home.classList.remove('current');
        console.log('Clicked Save Page');
        app.createSavedList();
    },
    goHomePage: () => {
        app.pages[0].classList.add('active');
        app.pages[1].classList.remove('active');
        let fav = document.querySelector('.fav');
        fav.classList.remove('current');
        console.log('Clicked Home Page');
    },

    /******************************************
                        SWIPE
    ******************************************/

    swipeLeft: (ev) => {
        app.getMoreProfiles();
        //swiped left... add the class 'goleft' to the element
        let div = ev.currentTarget;
        console.log('Swiped left on div:', div);
        div.classList.remove('active');
        div.classList.add('left');
        div.classList.add('goleft');
        document.querySelector('.overleft').style.display = "block"; 
        //remove the div from its parent element after 0.5s
        setTimeout((function () {
            document.querySelector('.overleft').style.display = "none"; 
            this.parentElement.removeChild(this);
        }).bind(div), 500);
    },
    swipeRight: (ev) => {
        //swiped right... add the class 'goright' to the element
        let div = ev.currentTarget;

        console.log('Swipe right on div', div);
        app.getMoreProfiles();
        let dataID = div.getAttribute('data-id');
        div.classList.remove('active');
        div.classList.add('right');
        div.classList.add('goright');
        document.querySelector('.overright').style.display = "block";
        //remove the div from its parent element after 0.5s
        setTimeout((function () {
            document.querySelector('.overright').style.display = "none";
            this.parentElement.removeChild(this);
        }).bind(div), 500);

        //save specific profile to session storage 
        app.profiles.forEach((profile) => {
            if (profile.id == dataID) {
                app.savedProfiles.push(profile)
            }
        })
        //session storage
        sessionStorage.setItem(app.profileKey, JSON.stringify(app.savedProfiles));
        console.log("Saving current profile to Session Storage");
        
    },

    /******************************************
                FETCH MORE PROFILES
    ******************************************/

    getMoreProfiles: () => {
        let count = document.querySelector('.homepage').children;
        console.log(count);
        if(count.length < 3) {
            app.getTundraAPI();
        }
    },
    
    /******************************************
                    CREATE CARDS
    ******************************************/

    createCards: () => {
        console.log('GLOBAL ARRAY:', app.profiles);
        let newArray = app.profiles.reverse();
        console.log("Reverse this", newArray);
        newArray.forEach((profile) => {


            let section = document.querySelector('.homepage');
            let contentDiv = document.createElement('div');
            contentDiv.setAttribute('class', 'card fixed active');
            contentDiv.setAttribute('data-id', profile.id); 
            section.appendChild(contentDiv);

            let img = document.createElement('img');
            img.setAttribute('class', 'round');
            img.setAttribute('src', `https:${app.imgURL}${profile.avatar}`); // Insert image variable
            img.setAttribute('alt', 'Emoji');
            contentDiv.appendChild(img);

            let name = document.createElement('p');
            name.textContent = `${profile.first} ${profile.last}`; // Insert name variable
            contentDiv.appendChild(name);
            
            let gender = document.createElement('p');
            gender.textContent = `Gender: ${profile.gender}`; // Insert gender variable
            contentDiv.appendChild(gender);

            let distance = document.createElement('p');
            distance.textContent = `Distance: ${profile.distance}`; // Insert Distance Variable
            contentDiv.appendChild(distance);
        })
    },

    /******************************************
                CREATE SAVED LIST
    ******************************************/

    createSavedList: () => {
        if (sessionStorage.getItem(app.profileKey)) {
            app.savedProfiles = JSON.parse(sessionStorage.getItem(app.profileKey));
            // console.log(app.savedProfiles);
            let ul = document.querySelector('.list-view')
            ul.innerHTML ="";

            app.savedProfiles.forEach(profile => {
                // console.log(profile);
                let ul = document.querySelector('.list-view')
                let li = document.createElement('li');
                li.setAttribute('class', 'list-item');
                ul.appendChild(li);

                let imgDiv = document.createElement('div');
                imgDiv.setAttribute('class', 'action-left');

                let img = document.createElement('img');
                img.setAttribute('class', 'avatar');
                img.setAttribute('src', `https:${app.imgURL}${profile.avatar}`);
                img.setAttribute('alt', 'happy');
                imgDiv.appendChild(img);
                li.appendChild(imgDiv);

                let textDiv = document.createElement('div');
                textDiv.setAttribute('class', 'list-text');
                let name = document.createElement('p');
                name.textContent = `${profile.first} ${profile.last}`;
                textDiv.appendChild(name);
                li.appendChild(textDiv);

                let iconDiv = document.createElement('div');
                iconDiv.setAttribute('class', 'action-right');

                let icon = document.createElement('i');
                icon.setAttribute('class', 'icon clear');
                icon.addEventListener('click', () => app.removeSessionStorage(profile));
                iconDiv.appendChild(icon);
                li.appendChild(iconDiv);
            })
        }
    },

    /******************************************
                DELETE FROM FAV
    ******************************************/

    removeSessionStorage: (profile) => {
        let save = document.querySelector('.fav');
        save.classList.add('current');
        for (let i = 0; i < app.savedProfiles.length; i++) {
            let item = app.savedProfiles[i].id; //Compare id if no matches then delete 
            if (item == profile.id) {
                console.log("Delete Profile:", profile);
                let ul = document.querySelector('.list-view');
                ul.removeChild(ul.children[i]);
                app.savedProfiles.splice(i, 1);
                break;
            }
        }
        sessionStorage.setItem(app.profileKey, JSON.stringify(app.savedProfiles));
    },

};

app.init();