const courseModel = require("../models/courseModel");
const staticFileController = require("./staticFileController");
const checkSession = require("../models/sessionModel").checkSession;
const ejs = require("ejs");
const path = require("path");

async function saveForm(data, res) {
  try {
    //get the id of the current user
    let result = await checkSession(data.headers);
    id = JSON.parse(result);
    data.payload.user_id = id["user_id"];

    console.log(
      "Form info: user: " +
        data.payload.user_id +
        ", progress: " +
        data.payload.progress
    );

    await courseModel.updateProgress(data.payload);

    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ data: data.payload }));
  } catch (err) {
    console.log(err);
    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ error: err }));
  }
}

function toFormalEncoding(string)
{
  string = string.charAt(0).toUpperCase() + string.slice(1); // capitalize
  string = string.replace('_', ' ');
  return string;
}

async function getProgress(data, res) {
  try {
    //get the id of the current user
    let result = await checkSession(data.headers);
    id = JSON.parse(result);

    let info = {
      user_id: id["user_id"],
      course_name: toFormalEncoding(data.headers.course),
    };

    let prog = await courseModel.getCourseProgress(info);

    console.log("The progress for course " + data.headers.course + ": " + prog);
    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ progress: prog }));
  } catch (err) {
    console.log(err);
    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ error: err }));
  }
}



async function getCourses(data, res) {
  let result = await staticFileController.restrictedFile(data, res);
  if ("error" in result) // nu a existat sesiune si userul a fost deja redirectat catre pagina de login
    return;

  let bookmarked = await courseModel.getBookmarked(result.user_id);

  console.log(bookmarked);

  try {
    ejs.renderFile(path.join(__dirname, "/../views/courses.ejs"), bookmarked, {}, (err, result) => {
      if (err)
        throw err;

      res.writeHead(200, { "Content-type": "text/html" });
      res.end(result);
    });
  } catch (err) {
    console.log(err);
    res.writeHead(500);
    res.end();
  }
}

async function getCourse(data, res)
{
    let course_name =  data.path.split('/')[1];
    course_name = course_name.charAt(0).toUpperCase() + course_name.slice(1); // capitalize
    course_name = course_name.replace('_', ' ');

    console.log('nume curs' + course_name);


    let course = await courseModel.getCourseByName(course_name);
    if("error" in course)
    {
        res.head(404);
        res.end('Course not found');
        return;
    }

    try{
        ejs.renderFile(path.join(__dirname, "/../views/course_template.ejs"), course, {}, (err, result) =>{
            if(err)
                throw err;
            
            res.writeHead(200, {"Content-type":"text/html"});
            res.end(result);
        });
    } catch (err)
    {
        console.log(err);
        res.writeHead(500);
        res.end();
    }
    
}

async function saveBookmark(data, res) {
  try {
    //get the id of the current user
    let result = await checkSession(data.headers);
    let id = JSON.parse(result);
    data.payload.user_id = id["user_id"];

    console.log(
      "course name: " +
      data.payload.course_name +
      ", bookmarked: " +
      data.payload.bookmarked + 
      ", user: " +
      data.payload.user_id
    );

    await courseModel.updateBookmark(data.payload);

    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ data: data.payload }));
  } catch (err) {
    console.log(err);
    res.setHeader("Content-type", "application/json");
    res.end(JSON.stringify({ error: err }));
  }
}

module.exports = {saveForm, getProgress, getCourses, getCourse, saveBookmark}
