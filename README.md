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
  DEFAULT_TAG_ENABLED: 'true'
  DEFAULT_TAG_PATTERN: '^(?!.+(-SNAPSHOT)$).+$'
  DEFAULT_TAG_OVERRIDE: 'true'

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
        description: Project framework
        type: choice
        default: Maven
        options:
          - Maven
          - Gradle
          - NPM
          - PyPi

      build-arguments:
        description: Additional arguments for the maven build
        required: false

      commitish:
        description: Git reference (branch/commit) to trigger the build on
        default: ''
        required: false

      create-tag-enabled:
        description: Create a tag
        type: boolean
        default: 'true'

      create-tag-pattern:
        description: The pattern that should generate tags. JavaScript regex syntax
        required: false
        default: '^(?!.+(-SNAPSHOT)$).+$'

      create-tag-allow-override:
        description: Override existing tags
        type: boolean
        default: 'true'

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
          create-tag-enabled: ${{ inputs.create-tag-enabled || env.DEFAULT_TAG_ENABLED }}
          create-tag-pattern: ${{ inputs.create-tag-pattern || env.DEFAULT_TAG_PATTERN }}
          create-tag-allow-override: ${{ inputs.create-tag-allow-override || env.DEFAULT_TAG_OVERRIDE }}

```

### Example 2. Release on another repository.
In the event that the artifacts shall be pushed to another repository, you'd first need to configure a Github action secret.
In the example below, this secret is called 'RELEASE_PAT_TOKEN', and is a generated PAT token for Github with access to both this, and the target release repository.

The YAML can look like the following:
```yaml
name: Release in another repository

env:
  EVENT_BRANCH_NAME: ${{ github.head_ref || github.ref_name || '' }}
  DEFAULT_FRAMEWORK: Maven
  DEFAULT_TAG_ENABLED: true
  DEFAULT_TAG_PATTERN: '^(?!.+(-SNAPSHOT)$).+$'
  DEFAULT_TAG_OVERRIDE: true
  RELEASE_REPOSITORY: Frejdh/releases-test

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
        description: Project framework
        type: choice
        default: Maven
        options:
          - Maven
          - Gradle
          - NPM
          - PyPi

      build-arguments:
        description: Additional arguments for the maven build
        required: false

      commitish:
        description: Git reference (branch/commit) to trigger the build on
        default: ''
        required: false

      create-tag-enabled:
        description: Create a tag
        type: boolean
        default: 'true'

      create-tag-pattern:
        description: The pattern that should generate tags. JavaScript regex syntax
        required: false
        default: '^(?!.+(-SNAPSHOT)$).+$'

      create-tag-allow-override:
        description: Override existing tags
        type: boolean
        default: 'true'

      release-branch-repository:
        description: Target repository that shall contain the release
        default: Frejdh/releases-test

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Release artifacts
        uses: Frejdh/action-release-to-branch@master
        with:
          github-token: ${{ secrets.RELEASE_PAT_TOKEN || secrets.GITHUB_TOKEN }}
          project-framework: ${{ inputs.project-framework || env.DEFAULT_FRAMEWORK }}
          build-arguments: ${{ inputs.build-arguments }}
          commitish: ${{ inputs.commitish || env.EVENT_BRANCH_NAME }}
          create-tag-enabled: ${{ inputs.create-tag-enabled || env.DEFAULT_TAG_ENABLED }}
          create-tag-pattern: ${{ inputs.create-tag-pattern || env.DEFAULT_TAG_PATTERN }}
          create-tag-allow-override: ${{ inputs.create-tag-allow-override || env.DEFAULT_TAG_OVERRIDE }}
          release-branch-repository: ${{ inputs.release-branch-repository || env.RELEASE_REPOSITORY }}

```
