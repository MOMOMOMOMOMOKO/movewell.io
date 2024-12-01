// import * as bootstrap from "bootstrap";
const modal = document.querySelector(".modalFit");
const overlay = document.querySelector(".overlay");
const modalLogin = document.querySelector(".modalLogin");

const btnRegister = document.querySelector(".btn_register");
const btnLogin = document.querySelector(".btn_login");


const btnSubmit = document.querySelector('.btn_submit-modal');


const nameInput = document.querySelector(`.name-input`);
const passWd = document.querySelector(`.name-pwd`);
const rePassWd = document.querySelector(`.name-re-pwd`);
const tel = document.querySelector(`.tel-input`);
const menuDefine = document.querySelector(`.menu-define`);


const ageInput = document.querySelector(`.age-input`);
const bmiInput = document.querySelector(`.bmi-input`);
const availableTimes = document.querySelector(`.available-time-select`);
const logout = document.querySelector(`.logout`);


const greeting = document.querySelector(`.greeting`);
const openNav = document.querySelector(`.nav-open-button`);
const navBar = document.querySelector(`.nav`);
const showModal = document.querySelectorAll(`.show-modal`);
const modalBody = document.querySelector(`.modal-body`);
const modalClose = document.querySelector(`.modal-close`);
const modalCatText = document.querySelector(`.modal-cat-text`);
const modalCategory = document.querySelector(`.modal-category`);

const modalHealthRecord = document.querySelector(`.modal-category`);
const URL = "39.99.135.224:8080"

// App class

class Person {
    constructor(name, age, bmi) {
        this.name = name;
        this.age = age;
        this.bmi = bmi;
    }
}

class App {
    account = JSON.parse(localStorage.getItem("account"));
    workouts;

    constructor() {


        // localStorage.clear()

        if (!localStorage.getItem(`account`)) {
            this.#openLoginModal();
        } else {
            // Loading the workouts from local storage
            greeting.textContent = `Hello ` + this.account.name;
            this.workouts = this.#fetchWorkouts();
        }

        btnRegister.addEventListener("click", this.#btnRegister)

        btnLogin.addEventListener("click", this.#doBtnUserLogin)


        btnSubmit.addEventListener(`click`, this.#submitRegister.bind(this));

        openNav.addEventListener(`click`, this.#openNav);

        showModal.forEach(this.#showModal);
        modalClose.addEventListener(`click`, this.#closeModalCat);
    }

    #btnRegister = () => {
        this.#openModal()
        this.#closeLoginModal()


    };

    #doBtnUserLogin = () => {
        const userNameValue = document.querySelector(`.user_name_input`).value;
        const passwordValue = document.querySelector(`.pwd_input`).value;
        let data = {
            "username": userNameValue, "password": passwordValue
        }

        let pThis = this

        this.#doUserLogin(data).then(response => {
            if (response.code !== 0) {
                alert("fail")
                return
            }
            let userInfo = response.data
            pThis.account = new Person(userInfo.name, userInfo.age, userInfo.bmi);

            menuDefine.insertAdjacentHTML("beforeend", `
             <li><a href="#" class="logout" onclick="Logout()">LogOut</a></li>`)
            localStorage.setItem("account", JSON.stringify(pThis.account));
            pThis.#closeModal(false);

            greeting.textContent = `Hello ` + pThis.account.name;

        })


    };

    async #doUserLogin(postData) {
        const options = {
            url: `http://${URL}/api/login`, method: "POST", headers: {
                'Content-Type': 'application/json'  // 设置请求头，表明发送的数据类型为 JSON
            }, body: JSON.stringify(postData)
        };

        let response = await fetch(`http://${URL}/api/login`, options)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        return response.json()


    }


    #openLoginModal = () => {
        modalLogin.classList.remove("hidden");
        overlay.classList.remove("hidden");
    };


    #closeLoginModal = () => {
        modalLogin.classList.add("hidden");

    };
    #openModal = () => {
        modal.classList.remove("hidden");
    };

    #closeModal = (openLogin) => {

        modal.classList.add("hidden");
        modalLogin.classList.add("hidden");
        if (openLogin) {
            this.#openLoginModal()
            return
        }
        overlay.classList.add("hidden");

    };

    #submitRegister() {
        const radios = document.getElementsByName('mobility');
        const name = nameInput.value;
        const pwd = passWd.value;
        const re_pwd = rePassWd.value;
        const telValue = tel.value;
        const age = ageInput.value;
        const bmi = bmiInput.value;
        let mobilityValue
        radios.forEach(radio => {
            if (radio.checked) {
                mobilityValue = radio.value
                return
            }

        });
        const availableTimesValues = Array.from(availableTimes.selectedOptions).map(option => option.value);
        const location = this.getUserLocation();
        let pThis = this
        location.then(response => {
            let data = {
                "name": name,
                "pwd": pwd,
                "re_pwd": re_pwd,
                "telValue": telValue,
                "age": age,
                "bmi": bmi,
                "mobilityValue": mobilityValue,
                "availableTimesValues": availableTimesValues,
                "latitude": response.latitude,
                "longitude": response.longitude,
            }

            pThis.#doRegister(data).then(response => {
                if (response.code !== 0) {
                    alert("fail")
                    return
                }

                this.#closeModal(true);
            }).catch(err => {

            })


        })


    }

    async #doRegister(postData) {
        const options = {
            url: `http://${URL}/api/register`, method: "POST", headers: {
                'Content-Type': 'application/json'  // 设置请求头，表明发送的数据类型为 JSON
            }, body: JSON.stringify(postData)
        };

        let response = await fetch(`http://${URL}/api/register`, options)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        return response.json()


    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => resolve(position.coords), (error) => reject(error));
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }

    #closeModalCat() {
        modalCategory.classList.add(`hidden`);
        overlay.classList.add(`hidden`);
    }

    #openNav() {
        openNav.classList.toggle(`close`);
        navBar.classList.toggle(`hidden`);
    }

    // Function to fetch workouts for people with BMI values between 20 and 24.9
    async #fetchWorkouts(bmi) {
        try {
            const response = await fetch("./json/workouts.json"); // Replace 'workouts.json' with the actual path to your JSON file
            if (!response.ok) {
                throw new Error("Could Not get workouts.. Check your internet connection.");
            }

            const data = await response.json();

            // Filter workouts for people with BMI values between 20 and 24.9
            const workoutsInRange = data.workouts.filter((workout) => {
                return bmi > workout.bmi_range.from && bmi < workout.bmi_range.to;
            });

            // Check if there are any workouts in the range
            if (workoutsInRange.length === 0) {
                throw new Error("Could not find workouts for your range.");
            } else {
                return workoutsInRange;
            }
        } catch (error) {
            return error.message;
        }
    }

    // fetch health_monitoring
    async #fetchHealthMonitoring(age) {

        try {
            const response = await fetch("./json/health_monitoring.json"); // Replace 'workouts.json' with the actual path to your JSON file

            if (!response.ok) {
                throw new Error("Could Not get health records.. Check your internet connection.");
            }

            const data = await response.json();

            // Filter workouts for people with age values between 20 and 24.9
            const workoutsInRange = data.health_monitoring.filter((workout) => {
                return age > workout.age_range.from && age < workout.age_range.to;
            });

            // Check if there are any workouts in the range
            if (workoutsInRange.length === 0) {
                throw new Error("Could not find workouts for your range.");
            } else {
                return workoutsInRange;
            }
        } catch (error) {
            return error.message;
        }
    }

    // Fetch exercise monitoring criteria based on age
    async #fetchExerciseMonitoring(age) {
        try {
            const response = await fetch("./json/exercise_monitoring.json");
            if (!response.ok) {
                throw new Error("Could not retrieve exercise recommendations. Check your internet connection.");
            }

            const data = await response.json();
            console.log(data)
            // Filter recommendations for people within the specified age range and matching gender
            const exercisesInRange = data.exercise_monitoring.filter((exercise) => {
                const isInAgeRange = age > exercise.age_group.from && (exercise.age_group.to === null || age < exercise.age_group.to);
                return isInAgeRange;
            });

            console.log(exercisesInRange)

            // Check if there are any exercises in the range
            if (exercisesInRange.length === 0) {
                throw new Error("Could not find exercise recommendations for your age and gender.");
            } else {
                return exercisesInRange;
            }
        } catch (error) {
            return error.message;
        }
    }


    async #fetchDiets(bmi) {
        try {
            const response = await fetch("./json/diet.json");

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            // Filter diets for people with BMI values between 20 and 24.9
            const dietsInRange = data.diets.filter((diet) => {
                return bmi > diet.bmi_range.from && bmi < diet.bmi_range.to;
            });

            // Check if there are any diets in the range
            if (dietsInRange.length === 0) {
                throw new Error(`No workouts available for people with BMI values below 0`);
            } else {
                // Do something with the filtered workouts
                return dietsInRange;
            }
        } catch (error) {
            return error.message;
        }
    }

    async #fetchResources() {
        try {
            const response = await fetch(`./json/resources.json`);

            if (!response.ok) {
                throw new Error("Could Not get resources.");
            }

            const data = await response.json();

            return data;
        } catch (err) {
            return err.message;
        }
    }

    #openCategoryModal() {
        modalCategory.classList.remove(`hidden`);
        overlay.classList.remove(`hidden`);
    }

    #showModal = (btn) => {
        btn.addEventListener(`click`, function (e) {
            this.#openCategoryModal();
            let htmlBodyModal;
            const name = this.account.name;
            const age = this.account.age;
            const bmi = this.account.bmi;
            modalBody.innerHTML = "";
            if (btn.classList.contains(`fitness`)) {
                let workouts;

                (async () => {
                    try {
                        workouts = await this.#fetchWorkouts(bmi);

                        if (typeof workouts === "object") {
                            workouts.forEach((workout) => {
                                console.log(workout);
                                htmlBodyModal = `				
						<div class="workout">
							<div class="img-cont"><img src="${workout.image_url}" alt="A person ${workout.workout}" /></div>
							<div class="workout_name">${workout.workout}</div>
						</div>
					`;

                                modalBody.insertAdjacentHTML(`afterbegin`, htmlBodyModal);

                                modalCatText.innerHTML = `👋 ${name.split(` `)[0]} here are your
			<span class="highlight activity">workouts</span>`;
                            });
                        } else {
                            htmlBodyModal = `<div class="message">
						💥 Could Not Get workouts.. ${workouts}
					</div>`;
                            modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                        }
                    } catch (err) {
                        workouts = err.message;
                    }
                })();
            }

            if (btn.classList.contains(`diet`)) {
                let diets;
                (async () => {
                    try {
                        diets = await this.#fetchDiets(bmi);
                        // const { diets } = data.json();

                        if (typeof diets === "object") {
                            diets.forEach((diet) => {
                                htmlBodyModal = `				
						<div class="workout">
							<div class="img-cont"><img src = "${diet.image_url}" alt="A person ${diet.diet}" /></div>
							<div class="workout_name">${diet.diet}</div>
						</div>
					`;
                                modalCatText.innerHTML = `👋 ${name.split(` `)[0]} here are your
										<span class="highlight activity">diets</span>`;
                                modalBody.insertAdjacentHTML(`afterbegin`, htmlBodyModal);
                            });
                        } else {
                            htmlBodyModal = `<div class="message">
						💥 Could Not Get diets.. ${diets}
					</div>`;
                            modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                        }
                    } catch (err) {
                        diets = err.message;
                    }
                })();
            }

            if (btn.classList.contains(`resources`)) {
                let resources;
                (async () => {
                    try {
                        resources = await this.#fetchResources();

                        if (typeof resources === "object") {
                            resources.resources.forEach((resource, i) => {
                                htmlBodyModal = `				
						<div class="workout">
							<div class="img-cont"><img src = "${resource.image}" alt="${resource.title}" /></div>
							<a class="workout_name link href="${resource.link}">${resource.title}</a>
						</div>
					`;

                                modalCatText.innerHTML = `👋 ${name.split(` `)[0]} here are your
										<span class="highlight activity">resources</span>`;
                                modalBody.insertAdjacentHTML(`afterbegin`, htmlBodyModal);
                            });
                        } else {
                            htmlBodyModal = `<div class="message">
						💥 Could Not Get resources.. ${diets}
					</div>`;
                            modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                        }
                    } catch (err) {
                        resources = err.message;
                    }
                })();
            }
// fetch health monitoring

            if (btn.classList.contains(`health`)) {
                let healthRecommendations;
                (async () => {
                    try {
                        healthRecommendations = await this.#fetchHealthMonitoring(age); // Assuming age and gender are passed here
                        if (Array.isArray(healthRecommendations)) {

                            // Clear previous content if necessary
                            modalBody.innerHTML = '';

                            healthRecommendations.forEach((recommendation) => {
                                let htmlBodyModal = `				
						<div class="workout">
							<div class="workout_name">${recommendation.recommended_checkups.join(', ')}</div>
						</div>
					`;


                                // Close the container
                                htmlBodyModal += `</div>`;

                                modalBody.insertAdjacentHTML(`afterbegin`, htmlBodyModal);

                                modalCatText.innerHTML = `👋 ${name.split(` `)[0]}, here are your
<span class="highlight activity">Health Recommendations</span>`;
                            });
                        } else {
                            let htmlBodyModal = `<div class="message">
					💥 Could Not Get health recommendations: ${healthRecommendations}
				</div>`;
                            modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                        }
                    } catch (err) {
                        console.error(err);
                        let htmlBodyModal = `<div class="message">
				💥 Error fetching health recommendations: ${err.message}
			</div>`;
                        modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                    }
                })();
            }

// fetch exercise monitoring
            if (btn.classList.contains(`exercise_monitoring`)) {
                let exerciseRecommendations;
                (async () => {
                    try {
                        // Fetch recommendations based on age and gender
                        exerciseRecommendations = await this.#fetchExerciseMonitoring(age);
                        if (Array.isArray(exerciseRecommendations)) {

                            // Clear previous content if necessary
                            modalBody.innerHTML = '';

                            exerciseRecommendations.forEach((recommendation) => {
                                const {
                                    exercise_type, frequency_per_week, duration_per_session
                                } = recommendation.criteria;

                                // Template for displaying the recommendation
                                let htmlBodyModal = `
						<div class="exercise">
							<div class="exercise_type">Exercise: ${exercise_type}</div>
							<div class="frequency">Frequency per week: ${frequency_per_week} times</div>
							<div class="duration">Duration per session: ${duration_per_session}</div>
						</div>
					`;

                                modalBody.insertAdjacentHTML(`afterbegin`, htmlBodyModal);

                                modalCatText.innerHTML = `👋 ${name.split(` `)[0]}, here are your
<span class="highlight activity">Exercise Recommendations</span>`;
                            });
                        } else {
                            let htmlBodyModal = `<div class="message">
					💥 Could not get exercise recommendations: ${exerciseRecommendations}
				</div>`;
                            modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                        }
                    } catch (err) {
                        console.error(err);
                        let htmlBodyModal = `<div class="message">
				💥 Error fetching exercise recommendations: ${err.message}
			</div>`;
                        modalBody.insertAdjacentHTML(`beforeend`, htmlBodyModal);
                    }
                })();
            }


        }.bind(this));
    };
}

const _ = new App();

const back2Top = document.querySelector(".back2Top");
back2Top.addEventListener("click", () => {
    window.scrollTo(0, 0);
});
const header = document.querySelector(`.landing-page`);

const observer = new IntersectionObserver(([observer]) => {
    // const [obs] = observer;

    if (observer.isIntersecting) {
        back2Top.classList.add(`hidden`);
    } else {
        back2Top.classList.remove(`hidden`);
    }
});
observer.observe(header);

class ContinuousScrollingTicker {
    constructor() {
        this.tickerContentElement = document.getElementById("ticker-content");
        this.updateTickerContent();
        setInterval(() => this.updateTickerContent(), 1000 * 60);
    }

    async getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleString();
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => resolve(position.coords), (error) => reject(error));
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }

    async updateTickerContent() {
        try {
            const location = await this.getUserLocation();

            const locationString = await this.#getLocationStr(location.latitude, location.longitude);

            setInterval(async () => {
                const dateTime = await this.getCurrentDateTime();
                const tickerContent = `Current Date/Time: ${dateTime} | Location: ${locationString}`;
                this.tickerContentElement.textContent = tickerContent;
            }, 5000);
        } catch (error) {
            const dateTime = await this.getCurrentDateTime();
            this.tickerContentElement.textContent = `${dateTime} Error: ` + error.message;
        }
    }

    async #getLocationStr(lat, lon) {
        const url = `https://forward-reverse-geocoding.p.rapidapi.com/v1/reverse?lat=${lat}6&lon=${lon}&accept-language=en&polygon_threshold=0.0`;

        const options = {
            method: "GET", headers: {
                "X-RapidAPI-Key": "6fefec31a2msh37e747a16d3a8c7p1dc2c4jsnc95aa4fbb2e1",
                "X-RapidAPI-Host": "forward-reverse-geocoding.p.rapidapi.com",
            },
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return data.display_name;
        } catch (err) {
            return err.message;
        }
    }
}


// Create an instance of the ContinuousScrollingTicker class
const ticker = new ContinuousScrollingTicker();

function Logout() {

    localStorage.clear()
    location.reload()

}