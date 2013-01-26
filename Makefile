DATE=$(shell date +%I:%M%p)
STYLESHEETS = ./public/stylesheets
SASS = ${STYLESHEETS}/sass
TMP = ./tmp
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
CHECK=\033[32m✔\033[39m

build:
	@echo "\n${HR}"
	@echo "Building Alien Black..."
	@echo "${HR}\n"
	@echo "Setting up build environment...             ${CHECK} Done"
	@jshint js/bbui-reddit.js
	@jshint js/reddit.js
	@jshint js/comments.js
	@echo "Running JSHint on javascript...             ${CHECK} Done"
	@echo "Cleaning up build environment...            ${CHECK} Done"
	@zip -r /tmp/alienblack.zip . -x .*
	@/Developer/SDKs/Research\ In\ Motion/BlackBerry\ 10\ WebWorks\ SDK\ 1.0.4.7/bbwp /tmp/alienblack.zip -d -o /tmp/output
	@/Developer/SDKs/Research\ In\ Motion/BlackBerry\ 10\ WebWorks\ SDK\ 1.0.4.7/dependencies/tools/bin/blackberry-deploy -installApp -device 172.16.29.128 -package /tmp/output/simulator/alienblack.bar 
	@echo "\n${HR}"
	@echo "Alien Black successfully built at ${DATE}."
	@echo "${HR}\n"
