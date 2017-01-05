# Contributing to koa-router-rx

**Thank you for your interest in making koa-router-rx even better and more awesome. Your contributions are highly welcome.**

There are multiple ways of getting involved:

- [Report a bug](#report-a-bug)
- [Suggest a feature](#suggest-a-feature)
- [Contribute code](#contribute-code)

Below are a few guidelines we would like you to follow.
If you need help, please reach out to one or more of the [maintainers](https://github.com/mfellner/koa-router-rx/blob/master/MAINTAINERS).

## Report a bug
Reporting bugs is one of the best ways to contribute. Before creating a bug report, please check that an [issue](https://github.com/mfellner/koa-router-rx/issues) reporting the same problem does not already exist. If there is an such an issue, you may add your information as a comment.

To report a new bug you should open an issue that summarizes the bug and set the label to "bug".

If you want to provide a fix along with your bug report: That is great! In this case please send us a pull request as described in section [Contribute Code](#contribute-code).

## Suggest a feature
To request a new feature you should open an [issue](https://github.com/mfellner/koa-router-rx/issues/new) and summarize the desired functionality and its use case. Set the issue label to "feature".  

## Contribute code
This is a rough outline of what the workflow for code contributions looks like:
- Check the list of open [issues](https://github.com/mfellner/koa-router-rx/issues). Either assign an existing issue to yourself, or create a new one that you would like work on and discuss your ideas and use cases.
- Fork the repository on GitHub
- Create a topic branch from where you want to base your work. This is usually master.
- Make commits of logical units.
- Write good commit messages (see below).
- Push your changes to a topic branch in your fork of the repository.
- Submit a pull request to [mfellner/koa-router-rx](https://github.com/mfellner/koa-router-rx)
- Your pull request must receive a :thumbsup: from at least one [maintainer](https://github.com/mfellner/koa-router-rx/blob/master/MAINTAINERS)

Thanks for your contributions!

### Commit messages
Your commit messages ideally can answer two questions: **what** changed and **why**. The subject line should feature the "what" and the body of the commit should describe the "why" in the **present tense**. For example:

```
feat: add foo to the bar
```

koa-router-rx uses [commitizen](https://github.com/commitizen/cz-cli) style [semantic commit messages](https://seesparkbox.com/foundry/semantic_commit_messages). Messages should always be prefixed with one of the following tags:

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation only changes
style:    Changes that do not affect the meaning of the code
          (white-space, formatting, missing semi-colons, etc)
refactor: A code change that neither fixes a bug or adds a feature
perf:     A code change that improves performance
```

When creating a pull request, the description should also [reference the corresponding issue id](https://github.com/blog/1506-closing-issues-via-pull-requests). For example: `closes #1`.

**Have fun and enjoy hacking!**
