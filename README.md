# Github action for releasing artifacts into branches
Releases artifacts into a given branch

```
Frejdh/action-release-to-branch@master
```

## Supported frameworks/languages
* Java/Kotlin
    * Maven
    * Gradle

### Work in progress
Not added, but being worked on.
* Javascript/Typescript
    * NPM
* Python
    * PyPI

## Usage example
For all input parameters available, please check out the file [action.yml](action.yml).

For examples on how this can be configured, please see the example below.
This requires that a new file such as `.github/workflows/optional-filename.yml` is located inside your Github project.

### Example 1. Release on the same repository.
Triggers on push to certain branches, and can be manually triggered
```yaml
name: Release in this repository

env:
    EVENT_BRANCH_NAME: ${{ github.head_ref || github.ref_name || '' }}
    DEFAULT_FRAMEWORK: 'Maven'

on:
    push:
        branches:
            - master
            - main
            - develop
        paths-ignore:
            - '**.md'
            - '.github/workflows/**'
    workflow_dispatch:
        inputs:
            project-framework:
                description: Select what kind of framework the project uses. Note, only Maven is supported at the moment!
                type: choice
                default: Maven
                options:
                    - Maven
                    - Gradle
                    - NPM
                    - PyPi

            build-arguments:
                description: Arguments for the maven build. Default 'mvn -B install -e [CUSTOM ARGS]'
                required: false

            commitish:
                description: Git reference (branch/commit) to trigger the build on
                default: ''
                required: false

jobs:
    release:
        runs-on: ubuntu-latest
        steps:
            - name: Release artifacts
              uses: Frejdh/action-release-to-branch@master
              with:
                  github-token: ${{ secrets.GITHUB_TOKEN }}
                  project-framework: ${{ inputs.project-framework || env.DEFAULT_FRAMEWORK }}
                  build-arguments: ${{ inputs.build-arguments }}
                  commitish: ${{ inputs.commitish || env.EVENT_BRANCH_NAME }}


```
