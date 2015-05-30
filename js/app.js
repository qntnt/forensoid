var term_step = 1;

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
		list = "/"+list;
	}
	return list;
};

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
};



var steps = [
	{
		"step": 0,
		"heading": "Welcome to Forensoid, the Android forensics lab!",
		"body": "Let's get started.\nClick **Next Step**",
		"aside": "",
	},
	{
		"step": 1,
		"heading": "Step 1",
		"body": "**Directions**\nInput the command `sudo -s`.\nLogin in as `admin` with the password `password`.",
		"aside": "**Commands**\n`sudo -s` - Gain root permissions",
	},
	{
		"step": 2,
		"heading": "Step 2",
		"body": "**Directions**\nType `ls` to display the current directory listing.\nChange directories into `dev/sda`",
		"aside": "**Commands**\n`ls` - List segments or list files\n`cd` - Change directory",
	},
	{
		"step": 3,
		"heading": "Step 3",
		"body": "**Directions**\nNow we're going to begin copying files from the device to another directory.",
		"aside": "**Commands**",
	},
];

var Btn = React.createClass({
	handleClick: function(event) {
		this.props.nextStep();
	},
	render: function() {
		if (this.props.progress < this.props.step || this.props.step < 0) {
			return (
				<button onClick="{this.handleClick}" disabled >{this.props.value}</button>
			);
		}
		else {
			return (
				<button onClick={this.handleClick} >{this.props.value}</button>
			);
		}
	}
});

var Terminal = React.createClass({
	getInitialState: function() {
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

				if(this.name() == "root") {
					this.set_prompt("root "+listDir(dir)+"> ");
				}
				else {
					this.set_prompt(listDir(dir)+"> ");
				}

				if (term_step === 2)
					if(listDir(dir) == "/dev/sda/"){
						this.echo("TUTORIAL: Click [Next Step].");
						term_step = 3;
						this.set_command("");
					}
			},
			exit: function() {
				this.pop();
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
							callback('SECRET KEY');
							this.push(commands, {name:"root", prompt: "root > "});
							this.echo("TUTORIAL: Login successful! Click [Next Step].");

							// Update step
							if (term_step === 1)
								term_step = 2;
							this.set_command("");
						}
						else {
							callback(null);
						}
					});
				}
			}
		};

		return {commands: $.extend(init_commands, commands)};
	},
	componentDidMount: function() {
			$('#term').terminal( this.state.commands, {
				greetings: "",
				height: 300,
				prompt: "> ",
				name: "base",
				onCommandChange: this.props.onSubmit,
			});
	},
	render: function() {
		return (
		<section id="term" className="terminal" onSubmit={this.props.onSubmit}></section>
		);
	}
});

var Lab = React.createClass({
	getInitialState: function() {
		return {
			"progress": 1,
			"step": 0,
			"heading": "Welcome to Forensoid, the Android forensics lab!",
			"body": "Let's get started.\nClick **Next Step**",
			"aside": "",
			"complete": true,
		};
	},
	handleNext: function(event) {
		if (this.state.step < steps.length-1) {
			console.log("Moving to next step.");
			this.setState(steps[this.state.step + 1]);
		}
		else {
			console.log("At last step.")
		}
	},
	handlePrev: function(event) {
		if(this.state.step > 0) {
			console.log("Moving to previous step.");
			this.setState(steps[this.state.step - 1]);
		}
		else {
			console.log("Already at first step");
		}
	},
	handleSubmit: function(event) {
		if(this.state.progress <= term_step) {
			this.setState({progress: term_step});
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
				<Terminal onSubmit={this.handleSubmit}/>
				<footer>
					<Btn value="Previous Step" nextStep={this.handlePrev} step={this.state.step-1} progress={this.state.progress} />
					<Btn value="Next Step" nextStep={this.handleNext} step={this.state.step+1} progress={this.state.progress} />
				</footer>
			</section>
		);
	}
});

React.render(
	<main>
		<h1>Forensoid <small>Android forensics lab</small></h1>
		<Lab />
	</main>,
	document.getElementById('content')
);
