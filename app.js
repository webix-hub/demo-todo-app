function add_task(){
	var id = $$("list").add({
		done:-1, 
		value:"ToDo"
	}, 0);
	$$("list").resize();
	$$("list").edit(id);
}

function mark_task(e, id){ 
	$$("list").getItem(id).done = 1;
	$$("list").updateItem(id);
	list_filter();
}

//filtering grid
function list_filter(){
	var val = $$('selector').getValue() || -1;

	$$('list').filter(function(obj){
		return obj.done == val;
	});
	$$('list').resize();
}

webix.protoUI({
	name:"editlist"
}, webix.EditAbility, webix.ui.list);

var data_proxy = {
	$proxy :true,
	load:function(view, callback){
		view.parse(webix.storage.local.get("data"));
	},
	save:function(view, data){
		webix.storage.local.put("data", view.serialize(true) );
		webix.dp(view).reset();
	}
};

var toolbar = [
	{view:"button", value:"And new task", width: 150,
		click:add_task },
	{}, 
	{view:"segmented", id:"selector", width: 200, options: [
			{ id:-1, value:"Active"},
			{ id:1, value:"Finished"}
		],
		on:{ onChange : list_filter }
	}
];

var list = {
	view:"editlist", id:"list", borderless:true, autoheight:true,
	type:{	
		height:55, width:600,
		active:"<div class='todo_check'><input type='button' value='Finish'></div>",
		closed:"<div class='todo_check_done'> Done </div>",	
		template:function(obj, common){
			var active = (obj.done == -1);
			if (active)
				return common.active + obj.value;
			else 
				return common.closed + obj.value;
		}
	},
	onClick:{
		"todo_check" : mark_task
	},
	on:{
		//disallow edit for finished tasks
		onBeforeEditStart:function(id){
			if (this.getItem(id).done == 1)
				return false;
		},
		//delete empty task
		onAfterEditStop:function(state, editor){
			if (state.value == "")
				this.remove(editor.id);
		},
		//save data after reordering
		onAfterDropOrder:function(id){
			webix.dp(this).save(id);
		},
		//filter just after data loading
		onAfterLoad:list_filter
	},
	drag:"order",

	url: data_proxy,
	save:data_proxy,

	editable:true, editor:"text"
};

app = {};
app.ui = {
	container:"app_area",
	paddingX:20,
	rows: [
		{ paddingY:20, cols:toolbar },
		list	
	]
};