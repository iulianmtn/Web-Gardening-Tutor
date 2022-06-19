var selectedRow = null;

loadTable();

function loadTable(event) {
  // event.preventDefault();

  console.log("Loading table");

  let endpoint = "garden";
  getData(endpoint);
}
function getData(endpoint) {
  let url = `http://localhost:1234/${endpoint}`;
  let head = new Headers();

  let req = new Request(url, {
    method: "GET",
    headers: head,
  });
  fetch(req)
    .then((res) => res.json())
    .then((content) => {
      if ("error" in content) {
        //incerare esuata
        console.log(content.error);
      }
      if ("data" in content) {
        console.log("Got table: ", content.data);
        putInTable(content.data);
      }
    });
}

function putInTable(data) {
  data.forEach(function (line) {
    insertNewRecord(line);
  });
}
function onFormSubmit() {
  if (validateNullFields() && validateDueDate()) {
    var formData = readFormData();
    if (selectedRow == null) {
      insertNewRecord(formData);
      let endpoint = "garden_manager";
      sendData(formData, endpoint);
    }
    else updateRecord(formData);
    resetForm();
  }
}

function readFormData() {
  var formData = {};
  var select_stage = document.getElementById("stage");
  var select_interaction = document.getElementById("interaction");

  formData["plant_name"] = document.getElementById("name").value;
  formData["last_interaction"] =
    document.getElementById("last_interaction").value;
  formData["due_date"] = document.getElementById("due_date").value;
  formData["stage"] = select_stage.options[select_stage.selectedIndex].value;
  formData["interaction"] =
    select_interaction.options[select_interaction.selectedIndex].value;
  return formData;
}

function insertNewRecord(data) {
  var table = document
    .getElementById("plantList")
    .getElementsByTagName("tbody")[0];
  var newRow = table.insertRow(table.length);
  cell1 = newRow.insertCell(0);
  cell1.innerHTML = data.plant_name;
  cell2 = newRow.insertCell(1);
  cell2.innerHTML = data.last_interaction;
  cell3 = newRow.insertCell(2);
  cell3.innerHTML = data.due_date;
  console.log(data.due_date);
  cell4 = newRow.insertCell(3);
  cell4.innerHTML = data.stage;
  cell5 = newRow.insertCell(4);
  cell5.innerHTML = data.interaction;
  cell6 = newRow.insertCell(5);
  cell6.innerHTML = `<a class="edit-delete" onClick="onEdit(this)">Edit</a>
                       <a class="edit-delete" onClick="onDelete(this)">Delete</a>`;
}

function sendData(data, endpoint) {
  let url = `http://localhost:1234/${endpoint}`;
  let head = new Headers();
  head.append("Content-Type", "application/json");
  let req = new Request(url, {
    method: 'POST',
    mode: 'cors',
    headers: head,
    body: JSON.stringify(data)
  });
  fetch(req).then((res) => res.json())
    .then((content) => {
      if ("error" in content) {
        //incerare esuata
        console.log("Eroare ", content.error);
      }
      if ("data" in content) {
        console.log("Message ", content.data);
      }

    });
}

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("last_interaction").value = "";
  document.getElementById("due_date").value = "";
  document.getElementById("stage").value = "";
  document.getElementById("interaction").value = "";
  selectedRow = null;
}

function onEdit(td) {
  selectedRow = td.parentElement.parentElement;
  document.getElementById("name").value = selectedRow.cells[0].innerHTML;
  document.getElementById("last_interaction").value =
    selectedRow.cells[1].innerHTML;
  document.getElementById("due_date").value = selectedRow.cells[2].innerHTML;
  document.getElementById("stage").value = selectedRow.cells[3].innerHTML;
  document.getElementById("interaction").value = selectedRow.cells[4].innerHTML;
}

function updateRecord(formData) {
  selectedRow.cells[0].innerHTML = formData.name;
  selectedRow.cells[1].innerHTML = formData.last_interaction;
  selectedRow.cells[2].innerHTML = formData.due_date;
  selectedRow.cells[3].innerHTML = formData.stage;
  selectedRow.cells[4].innerHTML = formData.interaction;
}

function onDelete(td) {
  if (confirm("Are you sure you want to delete this record ?")) {
    row = td.parentElement.parentElement;
    document.getElementById("plantList").deleteRow(row.rowIndex);
    resetForm();
  }
}
function validateNullFields() {
  isValid = true;
  if (
    document.getElementById("name").value == "" ||
    document.getElementById("last_interaction").value == "" ||
    document.getElementById("due_date").value == "" ||
    document.getElementById("stage").value == "" ||
    document.getElementById("interaction").value == ""
  ) {
    isValid = false;
    alert("All the fields are required!");
  } else {
    isValid = true;
  }
  return isValid;
}

function validateDueDate() {
  isValid = true;
  if (
    document.getElementById("due_date").value <
    document.getElementById("last_interaction").value
  ) {
    isValid = false;
    alert("Due date cannot be lower than last interaction date!");
  } else {
    isValid = true;
  }
  return isValid;
}
