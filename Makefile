COMPOSE_NAME = happydoc-node-rtf

LOCAL_PROJECT_NAME := $(COMPOSE_NAME)-local

.PHONY: local
local: 
	npm install
	npm run build
