# Monthly operations report.
#   make faits   asks the agent for the highlights (one model call), when the CSV changes
#   make         rebuilds rapport.pdf without calling the model
# Agent: make faits AGENT=opencode

CSV = incidents.csv
AGENT ?= claude
MODEL = claude-sonnet-4-6

# opencode run does not expand custom commands: send the body of the command file
COMMAND = .opencode/commands/faits-marquants.md
ifeq ($(AGENT),opencode)
WRITE_FAITS = opencode run -m anthropic/$(MODEL) "$$(awk 'f >= 2; /^---$$/ { f++ }' $(COMMAND))"
else
WRITE_FAITS = claude -p "/faits-marquants" --model $(MODEL)
endif

.PHONY: all faits test clean

all: rapport.pdf

build/agregats.json: $(CSV) rapport.py
	uv run rapport.py agregats $(CSV) $@

# faits.json keeps the aggregates faits.md was written from
faits: build/agregats.json
	$(WRITE_FAITS) < build/agregats.json > faits.md.tmp
	mv faits.md.tmp faits.md
	cp build/agregats.json faits.json

build/rapport.md: build/agregats.json faits.md faits.json rapport.py
	@cmp -s build/agregats.json faits.json || { echo "faits.md was written for other data: run make faits" >&2; exit 1; }
	uv run rapport.py markdown build/agregats.json faits.md $@

rapport.pdf: build/rapport.md template.html rapport.css
	pandoc $< -s --template template.html --css rapport.css --wrap=none --pdf-engine=weasyprint -o $@

test:
	uv run pytest -q

clean:
	rm -rf build rapport.pdf
