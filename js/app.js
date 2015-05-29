var  = {
	
};

var commands = {
	sudo: function(a1) {
		if (a1 === '-s') {
			this.push(root_commands,{height: 300, name: 'root', prompt: 'root> '});
			this.login(function(u, p, callback) {
				if(u === "admin" && p === "password")
					callback('SECRET KEY');
			})
		}
	},
	exit: function() {
		this.pop();
	}
};

var steps = {
};

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
		jQuery('#term').terminal(commands, {
			greetings: false,
			prompt: "> ",
			height: 300,
		});
	},
	handleNext: function(event) {
		console.log("Moving to next step.");
		this.setState(steps[this.state.id + 1]);
	},
	handlePrev: function(event) {
		if(this.state.id > 0) {
			console.log("Moving to previous step.");
			this.setState(steps[this.state.id - 1]);
			jQuery('#term').pop();
		}
		else {
			console.log("Already at first step");
		}
	},
	render: function() {
		return (
			<section className="hero">
				<h3>{this.state.heading}</h3>
				<article>
					<p>{this.state.body}</p>
				</article>
				<aside>
					<p>{this.state.aside}</p>
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
		<Step steps={steps} stepId={0} />
	</main>,
	document.getElementById('content')
);
