# Project rules

* This is the task UI: board, list, graph, task panel, planner, analytics and settings.
* It talks to the coordinator only through the coordinator's HTTP API, on the same origin.
* Comments and docstrings are forbidden.
* Git commit messages must contain fewer than 10 words.
* Documentation is restricted to AGENTS.md.
* Avoid arbitrary limits.
* No agent can ever edit this file.
* Data should never be stored in or under this directory.
* Deploy with `pnpm run deploy`; it builds the UI and installs it in the coordinator's data directory under ui/.
