function set_issue_summary(obj_target_uuid, obj_list_uuid) {
  for (var i = 0; i < obj_list_uuid.uuid.length; i++)  {

    // Set page info
    obj_task = JSON.parse(getCookie(obj_list_uuid.uuid[i]));

    var elem_summary = document.getElementById("summary")
    
    var elem_row_1 = document.createElement("div"); // 用來表示一個 C (一整列)
    elem_row_1.className = "row align-items-center mt-3"
    
    var elem_col_1 = document.createElement("div"); // C icon
    elem_col_1.className = "col-3";
    
    var img_1 = document.createElement("img");
    img_1.src = obj_task.thumbnail;
    img_1.className = "w-100";

    var elem_col_2 = document.createElement("div"); // 右邊一整列
    elem_col_2.className = "col-9";
    
    var elem_row_2 = document.createElement("div"); // 右邊一行
    elem_row_2.className = "row";
    
    var elem_col_3 = document.createElement("div"); // 右上
    elem_col_3.className = "col d-flex justify-content: flex-start";

    var elem_row_3 = document.createElement("div"); // 右邊二行 
    elem_row_3.className = "row mt-2";

    var elem_col_4 = document.createElement("div");
    elem_col_4.className = "col d-flex justify-content: flex-start";
    
    var hr = document.createElement("hr");
    hr.className = "border-warning";

    // SDGs
    for (var index = 1; index <= 17; index++) {
      if ( obj_task.ticket[ "s" + index.toString()] == 1) {
        var img_upper = document.createElement("img");

          path = "static/imgs/SDGS/E_WEB_0";
          if (index > 10) {
	    path = "static/imgs/SDGS/E_WEB_";  
	  }

          img_upper.src = path + index.toString()  + ".png";
          img_upper.setAttribute("width", "40px");

	  if (index < 10) {
	    elem_col_3.appendChild(img_upper);
	  } else {
	    elem_col_4.appendChild(img_upper);
	  }
	}
    }

    // Append
    elem_summary.appendChild(elem_row_1);
    elem_row_1.appendChild(elem_col_1);
    elem_row_1.appendChild(elem_col_2);
    elem_row_1.appendChild(hr); 
    
    elem_col_1.appendChild(img_1);
    
    elem_col_2.appendChild(elem_row_2);
    elem_col_2.appendChild(elem_row_3);

    elem_row_2.appendChild(elem_col_3);
    elem_row_3.appendChild(elem_col_4);
  }
}

function ticket_summary(uuid_target) {
  var list_issues = [];
  var dataJSON = {};
  dataJSON.username = getCookie("username");
  $.ajax({
    url: HOST_URL_EID_DAEMON + "/tasks/list",
    type: "POST",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       // Set issue summary
       set_issue_summary(JSON.parse(getCookie(uuid_target)), obj);
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
}

// TODO
function set_content() {
}

function update_ticket(uuid_target, obj_target) {
  setCookie(uuid_target, JSON.stringify(obj_target), 1);
}

function set_task_in_page(obj) {
  var elem_issues_list = document.getElementById("issues-list");
  
  var col_md_4 = document.createElement("div");
  col_md_4.className = "col-md-4";

  var card_p_3_mb_2 = document.createElement("div");
  card_p_3_mb_2.className = "card p-3 mb-2";

  var img = document.createElement("img");
  img.src = obj.thumbnail;
  img.setAttribute("width", "160");
  img.setAttribute("height", "160");

  var a = document.createElement("a"); 
  a.src = obj.thumbnail;
  a.href = "/issues-1.html?uuid=" + obj.uuid;
  
  // Append
  elem_issues_list.appendChild(col_md_4);
  col_md_4.appendChild(card_p_3_mb_2);
  card_p_3_mb_2.appendChild(a);
  a.appendChild(img);
}

function get_task_info(req_uuid_task, set_page = 1) {
  $.ajax({
    url: HOST_URL_TPLANET_DAEMON + "/tasks/" + req_uuid_task,
    type: "GET",
    async: false,
    crossDomain: true,
    success: function(returnData) {
       var obj = JSON.parse(returnData);
       setCookie(obj.uuid, JSON.stringify(obj), 1);

       // Set ticket
       var dataJSON = {"s1":"0", "s2":"0", "s3":"0", "s4":"0", "s5":"0", "s6":"0", "s7":"0", 
         "s8":"0", "s9":"0", "s10":"0", "s11":"0", "s12":"0", "s13":"0", "s14":"0", "s15":"0", "s16":"0", "s17":"0"};
       
       obj.ticket =  dataJSON;
       update_ticket(req_uuid_task, obj);

       // Set tasks in weg page
       if (set_page == 1) {
         set_task_in_page(JSON.parse(getCookie(obj.uuid)));
       }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
}

function get_user_uuid_tasks(username) {
  var list_issues = [];
  var dataJSON = {};
  dataJSON.username = username;
  $.ajax({
    url: HOST_URL_EID_DAEMON + "/tasks/list",
    type: "POST",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       // Set Cookie
       setCookie("list_tasks", obj.uuid, 1);

       // Set task info
       for (var i = 0; i < obj.uuid.length; i++)  {
         var target_ticket = "";
         if (getCookie(obj.uuid[i]) != "") {
           var obj_uuid = JSON.parse(getCookie(obj.uuid[i]));
           if (obj_uuid.ticket != null) {
             target_ticket = obj_uuid.ticket;
           }
         } 

	 if( getCookie(obj.uuid[i]) == "" || obj_uuid.ticket == "") {
	     get_task_info(obj.uuid[i]);
	   } else {
             var obj_task = getCookie(obj.uuid[i]);
	     set_task_in_page(JSON.parse(obj_task));
	   }
       }
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
}

function list_issues(username) {
  get_user_uuid_tasks(username);
}

// -------------
function list_tasks(username) {
  var list_issues = [];
  var dataJSON = {};
  dataJSON.username = username;
  $.ajax({
    url: HOST_URL_EID_DAEMON + "/tasks/list",
    type: "POST",
    async: false,
    crossDomain: true,
    data:  dataJSON,
    success: function(returnData) {
       const obj = JSON.parse(returnData);
       // Set Cookie
       setCookie("list_tasks", obj.uuid, 1);
       list_issues = obj.uuid;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(thrownError);
    }
  });
  return list_issues;
}
