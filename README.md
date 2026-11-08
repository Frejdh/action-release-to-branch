# Github action for releasing artifacts into branches
Releases artifacts into a given branch

```
Frejdh/action-release-to-branch@v3
```

## Supported frameworks/languages
* Java/Kotlin
    * Maven
    * Gradle
* Javascript/Typescript (Github Pages deployment):
    * NPM
    * PNPM
    * Yarn

### Work in progress
Not added, but being worked on.
* Javascript/Typescript (dependencies):
    * NPM
    * Yarn
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
        uses: Frejdh/action-release-to-branch@v3
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

Example of a YAML job configuration (using the `RELEASE_PAT_TOKEN` secret and the `release` environment):
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
    environment: ${{ inputs.environment || vars.RELEASE_ENV || 'release' }}
    steps:
      - name: Release artifacts
        uses: Frejdh/action-release-to-branch@v3
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


### Example 3. Node project with deployment to GitHub pages
Builds a Node project, such as an Angular app, and pushes the built files to a separate GitHub Pages repository per deployment environment.
Pushing to another repository requires a personal access token (PAT), stored as an environment secret.

A fine-grained token can only access repositories owned by one user or organization, its resource owner.
If the source or a GitHub Pages repository is owned by another user, such as a repository you're only a collaborator on, use a classic token
with the `repo` scope instead, as in [example 2](#example-2-release-in-another-repository).

1. Go to https://github.com/settings/personal-access-tokens and generate a fine-grained token.
2. Under `Repository access`, select the source repository and every GitHub Pages repository the workflow pushes to. The token also checks out the source repository, so it needs access to it as well.
3. Under `Permissions`, set `Contents` to `Read and write`.
4. Copy the generated token value. It's only shown once.
5. In the source repository, go to `Settings` -> `Environments` and create an environment. This example names it `release`.
6. Under `Deployment branches and tags`, allow only the branches that may publish, such as `master`/`main`. Anyone who can run the workflow from another branch can change it to read the secret.
7. Add an environment secret named `RELEASE_PAT_TOKEN`, with the token as its value. Environment secrets are only available to jobs that declare the environment, as the job below does.

Configure GitHub Pages in each target repository to serve from the release branch (`master` below).
Files matching `node-files-to-keep`, such as `CNAME` for a custom domain and `.github` workflows, are kept when the old files are deleted.

The workflow always builds the branch it was started from, with no input for another branch or commit.
Otherwise anyone who can start it could build and run code from any branch with the token available, bypassing the branch restriction of the environment.

Example of a YAML job configuration (using the `RELEASE_PAT_TOKEN` secret and the `release` environment):
```yaml
name: Publish page

env:
  PROJECT_FRAMEWORK: Node
  NODE_VERSION: 24
  RELEASE_BRANCH: master

on:
  workflow_dispatch:
    inputs:
      deployment-environment:
        description: The deployment environment to target
        type: choice
        default: Development
        options:
          - Development
          - Production

concurrency:
  group: publish-page-${{ inputs.deployment-environment }}
  cancel-in-progress: false

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: release
    steps:
      - name: Resolve deployment environment
        shell: bash
        run: |
          if [[ "${{ inputs.deployment-environment }}" == "Production" ]]; then
            echo "Resolved production environment"
            echo "RELEASE_REPOSITORY=Frejdh/Frejdh-action-release-node-test-prod" >> "$GITHUB_ENV"
          else
            echo "Resolved development environment"
            echo "RELEASE_REPOSITORY=Frejdh/Frejdh-action-release-node-test-dev" >> "$GITHUB_ENV"
          fi

      - name: Build node project and push to GitHub pages repository
        uses: Frejdh/action-release-to-branch@v3
        with:
          github-token: ${{ secrets.RELEASE_PAT_TOKEN }}
          project-framework: ${{ env.PROJECT_FRAMEWORK }}
          commitish: ${{ github.ref_name }}
          create-tag-enabled: false
          release-branch-repository: ${{ env.RELEASE_REPOSITORY }}
          release-branch-name: ${{ env.RELEASE_BRANCH }}
          node-version: ${{ env.NODE_VERSION }}
          node-build-script: build
          # Angular's application builder writes the site to the browser subdirectory
          node-build-target-directory: dist/ui/browser
          delete-old-node-files: true
          node-files-to-keep: '^README.md$, ^readme.md$, ^CNAME$, ^[.].*'
```

