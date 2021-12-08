function getProjectWeight(list_task_UUIDs) {
  var projectWeight = {};
  var dataJSON = {};
  dataJSON.uuid = list_task_UUIDs[0];

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/projects/weight",
    type: "POST",
    async: false,
    crossDomain: true,
    data: dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       // Set project weight to cookie
       setCookie("project_weight", returnData, 1);
       projectWeight = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return projectWeight;
}

function submitTaskTickets(task_UUID) {
  if (getCookie(task_UUID)=== "") {
    return;
  }

  obj = JSON.parse(getCookie(task_UUID));
  var dataJSON = {"uuid": task_UUID,"sdgs-1":obj.ticket.s1,"sdgs-2":obj.ticket.s2,
          "sdgs-3":obj.ticket.s3,"sdgs-4":obj.ticket.s4,"sdgs-5":obj.ticket.s5,
          "sdgs-6":obj.ticket.s6,"sdgs-7":obj.ticket.s7,"sdgs-8":obj.ticket.s8,
          "sdgs-9":obj.ticket.s9,"sdgs-10":obj.ticket.s10,"sdgs-11":obj.ticket.s11,
          "sdgs-12":obj.ticket.s12,"sdgs-13":obj.ticket.s13,"sdgs-14":obj.ticket.s14,
          "sdgs-15":obj.ticket.s15,"sdgs-16":obj.ticket.s16,"sdgs-17":obj.ticket.s17};

  var taskWeight = {};

  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/tasks/submit",
    type: "POST",
    async: false,
    crossDomain: true,
    data: dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       // Set project weight to cookie
       setCookie("project_weight", returnData, 1);
       taskWeight = obj;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });

  return taskWeight;
}

function updateNodeData(baseNodes, baseLinks) {
  // Get user tasks
  var str_list_task_UUIDs = getCookie("list_tasks");
  var list_task_UUIDs  = [];
  if (str_list_task_UUIDs === "") {
    // Get user task UUIDs
    list_task_UUIDs = list_tasks(getCookie("username"));
  } else {
    list_task_UUIDs = str_list_task_UUIDs.split(",");
  }

  // Submit all tasks
  for (var index = 0; index < list_task_UUIDs.length; index ++) {
    submitTaskTickets(list_task_UUIDs[index]);
  }

  // Update Table data
  updateTalbeData();

  // Get personal weight
  var new_personal_node = [];
  for (var index = 0; index < list_task_UUIDs.length; index++) {
    // Get task info
    if (getCookie(list_task_UUIDs[index]) === "") {
      continue;
    }

    // Add nodes
    obj = JSON.parse(getCookie(list_task_UUIDs[index]));
    for (var index_sdgs = 1; index_sdgs < 18; index_sdgs++) {
      if (obj.ticket["s" + index_sdgs] != "0") {
        // { id: "personal"   , group: 18, label: "personal"   , level: 4 },

	var obj_personal = {};
        obj_personal.id = "personal-" + index.toString() + index_sdgs.toString();
        obj_personal.group = 18;
        obj_personal.label = "個人";
	baseNodes.push(obj_personal);

        var obj_new_node = {}
	obj_new_node.nodeid = obj_personal.id;
	obj_new_node.source = index_sdgs;
	new_personal_node.push(obj_new_node);
      }
    }
  }

  // Get project weight
  var projectWeight = getProjectWeight(list_task_UUIDs);
  var new_project_node = [];
  for (var index = 1; index < 18; index++) {
    if (projectWeight["sdgs-" + index] != "0") {
	// Add nodes
	for (var index_nodes_counts = 0; index_nodes_counts < parseInt(projectWeight["sdgs-" + index]); index_nodes_counts++) {
          // { id: "cumulative"   , group: 19, label: "專案"   , level: 4 },
          var obj_project = {};
          obj_project.id = "cumulative-" + index.toString() + index_nodes_counts.toString();
          obj_project.group = 19;
          obj_project.label = "專案";
          obj_project.level = 4;
          baseNodes.push(obj_project);

          var obj_new_node = {}
          obj_new_node.nodeid = obj_project.id;
          obj_new_node.source = index;
          new_project_node.push(obj_new_node);
	}
    }
  }


  // Updating links
  // { target: "SDG-1", source: "C" , strength: 0.5 }, 
  for (var index = 0; index < new_personal_node.length; index++) {
    obj = new_personal_node[index];

    var obj_personal = {};
    obj_personal.target = obj.nodeid ;
    obj_personal.source = "SDG-" + obj.source.toString();
    obj_personal.strength = 0.5;
    baseLinks.push(obj_personal);
  }

  for (var index = 0; index < new_project_node.length; index++) {
    obj = new_project_node[index];

    var obj_project = {};
    obj_project.target = obj.nodeid ;
    obj_project.source = "SDG-" + obj.source.toString();
    obj_project.strength = 0.5;
    baseLinks.push(obj_project);
  }

  return [baseNodes, baseLinks];
}

function updateTalbeData() {
  // Get user tasks
  var str_list_task_UUIDs = getCookie("list_tasks");
  var list_task_UUIDs  = [];
  if (str_list_task_UUIDs === "") {
    // Get user task UUIDs
    list_task_UUIDs = list_tasks(getCookie("username"));
  } else {
    list_task_UUIDs = str_list_task_UUIDs.split(",");
  }

  // Project
  var projectWeight = getProjectWeight(list_task_UUIDs);
  for (var index = 1; index <= 17; index ++) {
    document.getElementById("project_s" + index).innerHTML = projectWeight["sdgs-" + index];  
  }

  // Personal
  for (var index_uuid = 0; index_uuid < list_task_UUIDs.length; index_uuid++) {

  var str_obj_task = getCookie(list_task_UUIDs[index_uuid]);
    if (str_obj_task === "") {
      continue;
    }

    var obj_task = JSON.parse(str_obj_task);
    for (var index = 1; index <= 17; index ++) {
      document.getElementById("person_s" + index).innerHTML = (parseInt(document.getElementById("person_s" + index).innerHTML) + parseInt(obj_task.ticket["s" + index ]) ).toString();
    }
  }
}
