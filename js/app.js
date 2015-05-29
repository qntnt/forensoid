var term_step = 0;

var dir = {
	"dev": {
		"sda": {},
		"sdb": {},
	},
	"home": {},
};

var initDir = function(root) {
	if (!root) return;
	for (var n in root) {
		if (n != "parent" && n != "name") {
			console.log(n);
			root[n].name = n;
			root[n].parent = root;
			initDir(root[n]);
		}
	}
};

initDir(dir);

// Input: Object
// Output: "/dev/sda"
var listDir = function(d) {
	var list = "";
	while(d.name){
		list = d.name+"/"+list;
		d = d.parent;
	}
	if (list) {
		list = " /"+list;
	}
	return list;
}

// Input: "dev/sda"
// Output: ['dev', 'sda']
var parseDir = function(d){
	var list = [];
	var td = "";
	for(var i=0; i<d.length; i++) {
		if(d[i] == '/') {
			if (td) {
				list.push(td);
				td = "";
			}
		} else {
			td += d[i];
		}
	}
	list.push(td);
	return list;
}

var commands = {
	ls: function() {
		var list = Object.keys(dir);
		var pIndex = list.indexOf("parent");
		var nIndex = list.indexOf("name");
		if(pIndex != -1) {
			list.splice(pIndex, 1);
		}
		if(nIndex != -1) {
			list.splice(nIndex, 1);
		}
		list = list.join('\t', list);
		this.echo(list);
	},
	cd: function(next_dir) {
		var list = parseDir(next_dir);
		var td = dir;

		for(var i=0; i<list.length; i++) {
			if (list[i] == ".." && dir.parent) {
				console.log("Changing directories to parent.");
				dir = dir.parent;
			} else if (dir[list[i]]){
				dir = dir[list[i]];
			}
		}

		this.set_prompt("root"+listDir(dir)+"> ");
	},
	exit: function() {
		this.pop()
	},
};

var init_commands = {
	sudo: function(a1) {
		if (this.name == "root") {
			this.echo("Already root.");
		}
		if (a1 == '-s') {
			this.login(function(u, p, callback) {
				if(u == "q" || p == "q"){
					callback('FAILED');
				}
				if(u == "admin" && p == "password") {
					term_step += 1;
					callback('SECRET KEY');
					this.push(commands, {height: 300, name: 'root', prompt: 'root> '});
				}
			})
		}
	}
};

var steps = [
	{
		"id": 0,
		"heading": "Welcome to Forensoid, the Android forensics lab!",
		"body": "Let's get started.\n"
			+"Click **Next Step**",
		"aside": "",
		"complete": true,
	},
	{
		"id": 1,
		"heading": "Step 1",
		"body": "**Directions**\n"
			+"Input the command `sudo -s`.\n"
			+"Login in as `admin` with the password `password`.",
		"aside": "**Commands**\n"
			+"`sudo -s` - Gain root permissions",
		"complete": false,
	},
	{
		"id": 2,
		"heading": "Step 2",
		"body": "**Directions**\n"
			+"Type `ls` to display the current directory listing.\n"
			+"Change directories into `dev/sda`",
		"aside": "**Commands**\n"
			+"`ls` - List segments or list files\n"
			+"`cd` - Change directory",
		"complete": false,
	},
];

var Title = React.createClass({
	render: function() {
		return (
			<h1>Forensoid <small>Android forensics lab</small></h1>
		);
	}
});

var Btn = React.createClass({
	handleClick: function(event) {
		this.props.nextStep();
	},
	render: function() {
		return (
			<button onClick={this.handleClick}>{this.props.value}</button>
		);
	}
});

var Terminal = React.createClass({
	render: function() {
		return (
		<section id="term" className="terminal"></section>
		);
	}
});

var Step = React.createClass({
	getInitialState: function() {
		return steps[0];
	},
	componentDidMount: function() {
		console.log("Mounting");

		$('#term').terminal( init_commands, {
			greetings: "",
			height: 150,
			prompt: "> ",
			name: "base"
		});
	},
	handleNext: function(event) {
		if (this.state.id < steps.length-1) {
			console.log("Moving to next step.");
			this.setState(steps[this.state.id + 1]);
		} else {
			console.log("At last step.")
		}
	},
	handlePrev: function(event) {
		if(this.state.id > 0) {
			console.log("Moving to previous step.");
			this.setState(steps[this.state.id - 1]);
		}
		else {
			console.log("Already at first step");
		}
	},
	render: function() {
		var rawHeading = marked("###"+this.state.heading);
			var rawBody = marked(this.state.body);
				var rawAside = marked(this.state.aside);
		return (
			<section className="hero">
				<span dangerouslySetInnerHTML={{__html: rawHeading}} />
				<article>
					<span dangerouslySetInnerHTML={{__html: rawBody}} />
				</article>
				<aside>
					<span dangerouslySetInnerHTML={{__html: rawAside}} />
				</aside>
				<Terminal />
				<footer>
					<Btn value="Previous Step" nextStep={this.handlePrev} />
					<Btn value="Next Step" nextStep={this.handleNext} />
				</footer>
			</section>
		);
	}
});
React.render(
	<main>
		<Title />
		<Step />
	</main>,
	document.getElementById('content')
);
