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
		"heading": "Step 1 <small>Get root permissions</small>",
		"body": "**Directions**\nInput the command `sudo -s`.\nLogin in as `admin` with the password `password`.",
		"aside": "**Commands**\n`sudo -s` | Gain root permissions",
	},
	{
		"step": 2,
		"heading": "Step 2 <small>Locate Hard Drives/small>",
		"body": "**Directions**\nInput the command `fdisk -l`.",
		"aside": "**Commands**\n`fdisk -l` | Locate drives",
	},
	{
		"step": 3,
		"heading": "Step 3 <small>Changing directories</small>",
		"body": "**Directions**\nType `ls` to display the current directory listing.\nChange directories into `dev/sda`",
		"aside": "**Commands**\n`ls` | List segments or list files\n`cd` | Change directory",
	},
	{
		"step": 4,
		"heading": "Step 4 <small>Copying files</small>",
		"body": "**Directions**\nNow we're going to begin copying files from the device to another directory.",
		"aside": "**Commands**",
	},
	{
		"step": 5,
		"heading": "Step 5 <small>Zero the Hard Drive</small>",
		"body": "**Directions**\nWe're going to zero out the hard drive that we will copy into.\nUse `dd if=/dev/zero of=/dev/sdb`",
		"aside": "**Commands**",
	},
	{
		"step": 6,
		"heading": "Step 6 <small>Organize the Directories</small>",
		"body": "**Directions**\nLet's make some directories to store the evidence.\nUse the commands `mkdir /media/sdb/case_1` and `mkdir /media/sdb/case_1/evidence_1` to make the new directories.",
		"aside": "**Commands**`mkdir` | Make directory",
	},
	{
		"step": 7,
		"heading": "Step 7 <small>Create a Hash</small>",
		"body": "**Directions**\nWe will create a hash of the drive to ensure that data copies correctly from the evidence drive to our target drive.\nInput the command `md5sum /dev/sda |tee /media/sdb/case_1/evidence_1/pre-imagesource.md5.txt` to make an MD5 hash of the `/dev/sda` drive.\nThis hash will be located at `/media/sdb/case_1/evidence_1/pre-imagesource.md5.txt`.",
		"aside": "**Commands**`md5sum` | Create an MD5 hash",
	},
	{
		"step": 8,
		"heading": "Step 8 <small>Copy the Image</small>",
		"body": "**Directions**\nNow we're able to copy the image of the drive and be sure that it succeeds without error. Create the image of the drive with the command `dcfldd if=/dev/sda of=/media/sdb/case_1/HDimage_1.dd conv=noerror,sync hashwindow=0 hashlog=/media/sdb/case_1/evidence_1/post-imagesource.md5.txt`.\n**It's long, so be sure you don't have any typos.**",
		"aside": "**Commands**",
	},
	{
		"step": 9,
		"heading": "Step 9 <small>Check the Integrity of the Image</small>",
		"body": "**Directions**\nLet's check the MD5 hash of the image against the hash of the original.\n# TODO",
		"aside": "**Commands**",
	},
	{
		"step": 10,
		"heading": "Step 10 <small>Open Our Forensics Software</small>",
		"body": "**Directions**\n# TODO",
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
			dcfldd: function (inif, outof, conv, hashwindow, hashlog) {
				//TODO
			},
			md5sum: function (source, tee, target) {
				//TODO

			},
			dd: function (inif, outof) {
				//TODO

			},
			mkdir: function (str) {
				//TODO

			},
			fdisk: function (opt) {

			},
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

				if (term_step === 3)
					if(listDir(dir) == "/dev/sda/"){
						this.echo("TUTORIAL: Click [Next Step].");
						term_step = 10;
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
								term_step = 3;
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
