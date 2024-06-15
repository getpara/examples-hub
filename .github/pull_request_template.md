Please go through the checklist if you are the PR author or reviewer and ensure that every item is satisfied.

## Pull Request Checklist

- [ ] This PR does not depend on new backend changes and if it does, this PR will not be merged until the backend changes are deployed to production. Also, the relevant backend PR is linked in the description/comments.
- [ ] A new NPM release with this PR will not break an existing integration for a partner or cause a degraded experience if an existing integration bumps to the new version without making any other code change. If a breaking change is needed, discuss with the rest of the team first on a plan and use a major version bump.
- [ ] If this PR requires docs changes, a PR for the docs repo is ready to be merged after this PR is. Also, the relevant docs PR is linked in the description/comments.
- [ ] All the packages in this repo can be successfully built and the legacy-example still works with the changes in this PR.
- [ ] Running `yarn start` executes successfully and results in to runtime errors.
- [ ] Running `yarn start-bridge` executes successfully and results in no runtime errors.