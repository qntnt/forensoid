var term_step = 1;

var original_dir = {
	"dev": {
		"sda": {},
		"sdb": {},
	},
	"opt": {
		"AndroidSDK": {
			"platform-tools": {}
		}
	},
	"media": {},
	"home": {},
};

var dir = original_dir;

var adb = {
	"dev": {
		"mtdblock1": {
			"data": {
				"com.android.providers.telephony":{
					"databases": {
						"mmssms.db": {}
					}
				}
			}
		}
	}
};


var rootDir = dir;

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

initDir(adb);
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
		console.log(td);
		if(d[i] === '/') {
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
		"heading": "Welcome to Forensoid, the Android forensics lab!",
		"body": "**Don't click images directly to view them, or you will lose your place in the lab. Instead, right click and open it in a new tab.**\nLet's get started.\nClick **Next Step**",
		"aside": "",
	},
	{
		"heading": "Get root permissions",
		"body": "**Directions**\nInput the command `sudo -s`.\nLogin in as `admin` with the password `password`.",
		"aside": "**Commands**\n`sudo -s` | Gain root permissions",
	},
	{
		"heading": "Connect to the device via Android SDK",
		"body": "**Directions**\n`cd /opt/AndroidSDK/platform-tools`\nThen type `adb shell`\n",
		"aside": "**Why?**\n*The Android SDK allows the forensic investigator to connect to the suspect device and acquire an image for later analysis.*",
	},
	{
		"heading": "Determine partition to image",
		"body": "Use the `mount` command.\nlook for `/data`.",
		"aside": "**Why?**\n*All user data on an Android device is located under the data partition. Using the mount command, we can see where that particular point is mounted on the system. In this instance, /data is located at /dev/mtdblock1. Android stores it’s text message database in a SQLlite database located within the /data mount point. The SMS and MMS database is located under **/data/com.android.providers.telephony/databases/mmssms.db***"
	},
	{
		"heading": "Enable adb forwarding to use netcat for imaging",
		"body": "`adb forward tcp:8888 tcp:8888`",
		"aside": "**Why?**\n*While the forensic investigator can use a target drive as the destination for an image, they can also capture the required image using the adb tool and a network connection. We choose the latter in this case.*"
	},
	{
		"heading": "Image android device via netcat command",
		"body": "`dd if=/dev/mtdblock1 bs=512 conv=notrunc,noerror,sync | nc -l -p 8888`\n`nc 127.0.0.1 8888 > droid_image.img` on the examiner's terminal, not adb.",
		"aside": "**Why?**\n*Using the dd command and piping it to netcat (nc) allows us to capture a raw format image file from the /data mount point. Piping it to netcat allows us to stream that RAW file to the forensics examiners workstation for further storage and further analysis.*"
	},
	{
		"heading": "Create a Hash of the image",
		"body": "`md5sum droid_image.img > image_hash.txt`\nThen type `cat image_hash.txt` to view the hash.",
		"aside": "**Why?**\n*Using the md5 command allows the investigator to verify the integrity of the captured image file and prove that it has not been altered in any way.*"
	},
	{
		"heading": "Use Autopsy on Windows for analysis",
		"fullWidth": "Use Autopsy on Windows for analysis (windows autopsy does ext4 filesystems, linux version does not).\n\n* Create New Case\n![](/img/image4.png)\n* Import image file\n![](/img/image5.png)\n* Compare md5 hashes. *Right click and open the image in a new tab to see the small text*\n![](/img/image6.png)\n* Locate text file with text messaging data\n* Find the incriminating data if present.\n\n**Why?**\n*The initial capture using dd and netcat was on a linux forensics workstation, however, the forensic software Autopsy on Linux does not support the ext4 file format that the suspects device was formatted as. Due to this, the image file must be analyzed on the Windows version of Autopsy. Using Autopsy allows us to mount the image and search for text messages within the specified timeframe to determine whether or not the suspect was texting at the time of the incident. Autopsy automatically extracts the messages from the sms/mms database for analysis.*\n\n## So is he guilty?\nBased on the text messages, is the person guilty of texting while driving?\nType `1` for yes, and `2` for no."
	},
	{
		"heading": "Is the subject guilty?",
		"body": "",
		"aside": ""
	}
];

steps = steps.map(function (step, index) {
	if (!step.heading) step.heading = "";
	if (!step.body) step.body = "";
	if (!step.aside) step.aside = "";
	if (!step.fullWidth) step.fullWidth = "";
	step.step = index;
	return step;
});

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
			"1": function () {
				if (term_step === 7) {
					this.echo('Congratulations! You are right. Thanks for following along with this lab.');
				}
			},
			"2": function () {
				if (term_step === 7) {
					this.echo('Are you sure? Read the messages again.');
				}
			},

			goto: function () {
				term_step = arguments[0];
			},

			dcfldd: function (inif, outof, conv, hashwindow, hashlog) {
				//TODO
			},
			md5sum: function () {
				//TODO
					if (term_step === 6) term_step = 7;
					this.set_command('');

			},
			dd: function () {
				if (term_step === 5) {
					for (var i=0; i<arguments.length; i++) {this.echo(arguments[i])}
					if (arguments[0] === 'if=/dev/mtdblock1' && arguments[1] === 'bs=512' && arguments[2] === 'conv=notrunc,noerror,sync' && arguments[3] === '|' && arguments[4] === 'nc' && arguments[5] === '-l' && arguments[6] === '-p' && arguments[7] === 8888) {
						this.clear()
						this.echo('Good job! Now we\'re on the examiner\'s terminal')
					} else {
						this.echo('Something was wrong...');
					}
				}
			},
			cat: function () {
				if (arguments[0] === 'image_hash.txt') {
					this.echo('55ce338f0050c93695c8b2e4d45acfb0');
				}
			},
			nc: function () {
				if (term_step === 5) {
					if (arguments[0] === '127.0.0.1' && arguments[1] === 8888 && arguments[2] === '>' && arguments[3] === 'droid_image.img') {
						term_step = 6;
						this.set_command('');
					}
				}
			},
			"mkfs-t": function (ext3, target) {

			},
			mkdir: function (str) {
				var root = dir;
				var list = parseDir(str);

				for (var i=0; i<list.length; i++) {
					dir[list[i]] = {
						name: [list[i]],
						parent: dir
					};

					dir = dir[list[i]];
				}
				dir = root;
			},
			fdisk: function (opt) {
				if (opt === '-l') {
					this.echo('/dev/sda\t/dev/sdb');
				}
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
			adb: function (shell) {
				if (arguments.length == 1) {
					if(listDir(dir) == "/opt/AndroidSDK/platform-tools/" && term_step === 2){
						this.echo("TUTORIAL: Click [NEXT STEP].");
						term_step = 3;
						dir = adb;
						this.set_prompt('root > ');
						this.set_command("");
					}
				} if (arguments.length === 3) {
					if (arguments[0] === 'forward' && arguments[1] === 'tcp:8888' && arguments[2] === 'tcp:8888' && term_step === 4) {
						term_step = 5;
						this.set_command('');
					}
				}
			},
			cd: function() {
				var res = '';
				if (arguments.length > 1) {
					for (var i=0; i<arguments.length; i++) {
						res += arguments[i];
					}
				}
				var list = parseDir(res);
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

				console.log(term_step);
			},
			mount: function () {
				if (term_step === 3) {
					console.log("Changing step.");
					term_step = 4;
					this.echo("rootfs / rootfs ro,seclabel,relatime 0 0\ntmpfs /dev tmpfs rw,seclabe,nosuid,relatime,mode=755 0 0\ndevpts /dev/pts devpts rw,seclabel,nosuid,relatime,mode=600 0 0\nproc /proc proc rw,relatime 0 0\nsysfs /sys sysfs rw,seclabel,relatime 0 0\nselinuxfs /sys/fs/selinux selinuxfs rw,relatime 0 0\ndebugfs /sys/kernel/debug debugfs rw,relatime 0 0\nnone /acct cgroup rw,relatime,cpuacct 0 0\nnone /sys/fs/cgroup tmpfs rw,seclabel,relatime,mode=750,gid=1000 0 0\ntmpfs /mnt/asec tmpfs rw,seclabel,relatime,mode=755,gid=1000 0 0\ntmpfs /mnt/obb tmpfs rw,seclabel,relatime,mode=755,gid=1000 0 0\nnone /dev/cpuctl cgroup rw,relatime,cpu 0 0\n/dev/block/mtdblock0 /system ext4 ro,seclabel,relatime,data=ordered 0 0\n/dev/block/mtdblock1 /data ext4 rw,seclabel,nosuid,nodev,noatime,nomblk_io_submit,data=ordered 0 0\n/dev/block/mtdblock2 /cache ext4 rw,seclabel,nosuid,nodev,noatime,data=ordered 0 0\n/dev/block/void/179:0 /mnt/media_rw/sdcard vfat rw,dirsync,nosuid,nodev,noexec,relatime,uid=1023,gid=1023,fmask=0007,dmask=0007,allow_utime=0020,codepage=cp437,iocharset=iso8859-1,shortname=midex,utf8,errors=remound-ro 0 0\n/dev/fuse /storage/sdcard fuse rw,nosuid,nodev,noexec,relatime,user_id=1023,group_id=1023,default_permissions,allow_other 0 0");
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
							this.echo("TUTORIAL: Login successful! Click [NEXT STEP].");

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
				checkArity: false,
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
			"fullWidth": "",
			"body": "Let's get started.\nClick **Next Step**",
			"aside": "",
			"complete": true,
		};
	},
	componentDidMount: function () {
		$('img').attr('target', '_blank');
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
		var rawHeading = marked("### Step "+this.state.step+" <small>"+this.state.heading+"</small>");
		var rawFullWidth = marked(this.state.fullWidth);
		var rawBody = marked(this.state.body);
		var rawAside = marked(this.state.aside);
		return (
			<div>
			<section className="hero">
				<span dangerouslySetInnerHTML={{__html: rawHeading}} />
				<span dangerouslySetInnerHTML={{__html: rawFullWidth}}></span>
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
			</div>
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
