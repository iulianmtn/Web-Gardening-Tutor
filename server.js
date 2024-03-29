const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
// const StringDecoder = require("string_decoder").StringDecoder;
const util = require("util");

const fileController = require("./controllers/staticFileController");
const userController = require("./controllers/userController");
const courseController = require("./controllers/courseController");
const { createNullProtoObjWherePossible } = require("ejs/lib/utils");
const leaderboardController = require("./controllers/leaderboardController");
const gardenController = require("./controllers/gardenController");
const { profile } = require("console");

require("dotenv").config();

let port = process.env.PORT || 1234;
let host = process.env.HOST;

const server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let urlPath = parsedUrl.path.replace(/^\/+|\/+$/g, ""); //sterge slash-urile de la inceput si sfarsit
    if (urlPath == "") urlPath = "home";

    let qs = parsedUrl.query;
    let headers = req.headers;
    let method = req.method.toLocaleLowerCase();

    let payload = "";
    req.on("data", (chunk) => {
        payload += chunk.toString();
    });
    req.on("end", () => {
        let parsedPayload;
        if (payload != "") parsedPayload = JSON.parse(payload);

        let data = {
            path: urlPath,
            qureyString: qs,
            headers: headers,
            method: method,
            payload: parsedPayload,
        };

        switch (method) {
            case 'get':
                {
                    let route = null;
                    Object.keys(getRoutes).every((key) => {
                        if (new RegExp(key).test(urlPath)) {
                            route = getRoutes[key];
                            return false; //break
                        }
                        return true; //continue
                    })

                    // if(urlPath in getRoutes)
                    // {
                    //     route = getRoutes[urlPath];
                    // } else {
                    //     route = getRoutes["staticFile"];
                    // }

                    if (route == null) // daca nu s-a gasit o ruta
                    {
                        route = fileController.serveFile;
                    }
                    route(data, res);
                    break;

                   
                }
            case 'post': {
                let route;
                if (urlPath in postRoutes) {
                    route = postRoutes[urlPath];
                } else {
                    route = (data, res) => (console.log('nimic'));
                }
                route(data, res);
                break;
            }
            case 'delete': {
                let route;
                if (urlPath in deleteRoutes) {
                    route = deleteRoutes[urlPath];
                } else {
                    route = (data, res) => console.log("nimic");
                }
                route(data, res);
                break;
            }

            case 'put': {
                let route;
                if (urlPath in putRoutes) {
                    route = putRoutes[urlPath];
                } else {
                    route = (data, res) => console.log("nimic");
                }
                route(data, res);
                break;
            }
        }
    });
});

const getRoutes = {
    "^staticFile$": fileController.serveFile,
    "^profile$": userController.getProfile,
    "^courses$": courseController.getCourses,
    "^courses/\\w+$": courseController.getCourse, // path: courses/:course
    staticFile: fileController.serveFile,
    "^leaderboard$": leaderboardController.gettopUsers,
    "^course_template$": courseController.getProgress,
    "^gardenmanager$": gardenController.getPlants
};


const postRoutes = {
    register: userController.register,
    login: userController.login,
    course_template: courseController.saveForm,
    logout: userController.logout,
    garden_manager: gardenController.savePlants,
    courses: courseController.saveBookmark,
    profile: userController.saveInformation,
    save_image: userController.saveImage
};

const putRoutes = {
    garden_manager: gardenController.updatePlants,
};

const deleteRoutes = {
    garden_manager: gardenController.deletePlants
};

server.listen(port, host, () => console.log(`listening on  ${host}:${port}`));
