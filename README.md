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

### Example 1. Release in the same repository.
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

### Example 2. Release in another repository.
In the event that the artifacts shall be pushed to another repository, you'd first need to configure a GitHub action secret.

In the following scenario, a classic PAT token will be generated.
Please note that the user that you're generating the PAT for needs read/write access to both the source repository, and the target/release repository.

1. Navigate to your user profile and open `Developer Settings -> Tokens (classic)` or go directly to: https://github.com/settings/tokens
2. Generate a new token, and require at least at minimum the `repo` permissions for read/write.
3. Copy the generated token value. The value will disappear forever when you close the page, so please save it somewhere appropriately.
4. Go to the source repository you want to do the release on. Go to `Settings` -> `Environments` and create a new one, or modify an existing one. In this example, I'll be naming it `release`.
5. Add the branches that should be able to access this PAT key. It's recommended to restrict the access to only production branches such as `master`/`main`.
6. Add the environment secret. Use whatever key you want, but in this example we'll use `RELEASE_PAT_TOKEN`. The value should be the previously generated PAT.

Example of a YAML job configuration (using the `RELEASE_PAT_TOKEN` secret, and `release` environment):
```yaml
name: Release in another repository

env:
  EVENT_BRANCH_NAME: ${{ github.head_ref || github.ref_name || '' }}
  DEFAULT_ENV: release
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
      environment:
        description: "Job environment"
        default: 'release'
        required: true
        type: environment

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
        default: true

      create-tag-pattern:
        description: The pattern that should generate tags. JavaScript regex syntax
        required: false
        default: '^(?!.+(-SNAPSHOT)$).+$'

      create-tag-allow-override:
        description: Override existing tags
        type: boolean
        default: true

      release-branch-repository:
        description: Target repository that shall contain the release
        default: Frejdh/releases-test

jobs:
  release:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || env.DEFAULT_ENV }}
    steps:
      - name: Release artifacts
        uses: Frejdh/action-release-to-branch@master
        with:
          github-token: ${{ secrets.RELEASE_PAT_TOKEN }}
          project-framework: ${{ inputs.project-framework || env.DEFAULT_FRAMEWORK }}
          build-arguments: ${{ inputs.build-arguments }}
          commitish: ${{ inputs.commitish || env.EVENT_BRANCH_NAME }}
          create-tag-enabled: ${{ inputs.create-tag-enabled || env.DEFAULT_TAG_ENABLED }}
          create-tag-pattern: ${{ inputs.create-tag-pattern || env.DEFAULT_TAG_PATTERN }}
          create-tag-allow-override: ${{ inputs.create-tag-allow-override || env.DEFAULT_TAG_OVERRIDE }}
          release-branch-repository: ${{ inputs.release-branch-repository || env.RELEASE_REPOSITORY }}
```
