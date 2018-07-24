# BankTest

This project it's a Test to see if I can work with Neo4j only using JS code.

Still just a test, I work with only one document

The goal it's making a page where you can import your own files and see the data you want(Movements, Banks, accounts)

Some help would be great!

# Before you start
You'll need some pieces for this. Node it's one.

Here you can [download Node.js](https://nodejs.org/en/ "Node.js")

I recommend reading some documentation:

[Neo4j Sandbox](https://neo4j.com/sandbox-v2/)

[Cypher language](https://neo4j.com/developer/cypher/)

[Canvas JS (Scatter dashboard)](https://canvasjs.com/html5-javascript-scatter-point-chart/)

[EJS](http://www.embeddedjs.com/ "Embedded JavaScript Templates")

# Let's Start

Once you have Node.js installed you'll have a Node.js command prompt

1. Clone the repo. You can do it with `git clone https://github.com/Cova14/BankTest.git` in your command prompt. Github Desktop works too.
2. On the cmd go to your cloned directory `cd Documents\my_cloned_dir`.
3. Then `npm install`, this will install all the libraries we need. This libraries are in the package.json file.
4. If everything it's okay go to localhost:3000

# It doesn't work?
What annoying, right? Don't worry.

In this project we're using the Neo4j Sandbox (Documentation above). This provide a temporal db to use (2/3 days), you can Expand it, but only for 7 days.

So, if the previous db expired or maybe you want to use your own db just go to the [Neo4j Sandbox](https://neo4j.com/sandbox-v2/) and create a new Sandbox

Then go to the Code tab and select JS. Once there you'll find something like this: 

`var driver = neo4j.driver('bolt://34.239.207.52:32955', neo4j.auth.basic('neo4j', 'polish-splicers-rifles'));`

Copy that (not this one, the one in the sandbox) and replace it in the app.js file

Try again!

# Any issue?

Feel free to let me know if there´s something wrong
