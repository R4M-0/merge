# Contributing

Thank you for interest in improving this project! Here's how to get involved.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Ways to Contribute

### Reporting Issues

- Check existing issues first (may already be addressed)
- Provide a clear title and detailed description
- Include steps to reproduce for bugs
- Share what you expected vs. what actually happened
- Add screenshots/PDFs when relevant

### Improving Code

1. **Fork and clone** this repository
2. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make focused changes** — keep commits small and logical
4. **Write/update tests** if applicable
5. **Run type checking and linting:**
   ```bash
   npm run typecheck
   npm run lint
   ```
6. **Push and open a pull request** with a clear description

### Improving Docs

Documentation improvements are always welcome! You can:
- Fix typos and unclear sections
- Add examples or clarifications
- Improve code comments
- Update API documentation

## Commit Message Format

Use clear, conventional commit messages:

```
feat(scope): brief description

Longer explanation if needed. Reference issues with #123.

Co-authored-by: Name <email@example.com>
```

Examples:
```
feat(pdf): improve table rendering with proper alignment
fix(analyze): handle edge case when user has no repos
refactor(generate): simplify bullet point logic
docs(README): add deployment section
```

## Pull Request Guidelines

- **One feature per PR** — keep scope focused
- **Update relevant docs** if changing functionality
- **Write a clear PR description** explaining what and why
- **Link related issues** with "Closes #123"
- **Keep commits clean** (can squash if needed)

## Questions?

Open a discussion or issue—we're here to help!
