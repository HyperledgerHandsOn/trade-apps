# GENERAL PATH DEFINITIONS
ROOT_DIR=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
DIST_DIR=$(ROOT_DIR)/dist
DOCKER_IMAGE_BUILD=node:12.13
DOCKER_IMAGE=carrier-rest
DOCKER_VERSION=latest

BUILD_CMD=npm install
UNITTEST_CMD=npm test

ifdef DOCKER_ORG
	DOCKER_FULL_IMAGE=${DOCKER_ORG}/${DOCKER_IMAGE}:${DOCKER_VERSION}
else
	DOCKER_FULL_IMAGE=${DOCKER_IMAGE}:${DOCKER_VERSION}
endif

.PHONY: all
all: clean build test package

$(DIST_DIR):
	echo ">> Creating distribution directory"  
	mkdir -p $(DIST_DIR)

.PHONY: build
build: $(DIST_DIR)
	echo ">> Building application"
	docker run --rm -v $(ROOT_DIR):/src -v $(DIST_DIR):/dist -w /src ${DOCKER_IMAGE_BUILD} sh -c "$(BUILD_CMD)"

.PHONY: test
test: 
	echo ">> Running application unit-test"
	docker run --rm -v $(ROOT_DIR):/src -v $(DIST_DIR):/dist -w /src ${DOCKER_IMAGE_BUILD} sh -c "$(UNITTEST_CMD)"

.PHONY: package
package: $(DIST_DIR)
	echo ">> Packaging application"
	docker build -t $(DOCKER_FULL_IMAGE) .

.PHONY: release
release: $(DIST_DIR) 
	echo ">> Publishing application to DockerHub"
	docker push $(DOCKER_FULL_IMAGE)

.PHONY: clean
clean: 
	echo ">> cleaning dist directory"
	rm -rf $(ROOT_DIR)/dist
	rm -rf $(ROOT_DIR)/node_modules
	rm -rf $(ROOT_DIR)/coverage
	rm -rf $(ROOT_DIR)/.nyc_output
